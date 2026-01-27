const captainModel = require('../models/captain.model');


module.exports.createCaptain = async ({
    firstname, lastname, email, password, color, plate, capacity, vehicleType
}) => {
    if (!firstname || !email || !password || !color || !plate || !capacity || !vehicleType) {
        throw new Error('All fields are required');
    }
    const captain = captainModel.create({
        fullname: {
            firstname,
            lastname
        },
        email,
        password,
        vehicle: {
            color,
            plate,
            capacity,
            vehicleType
        }
    })

    return captain;
}

const rabbitMQ = require('./rabbitmq.service');
const redisService = require('./redis.service');
const mapService = require('./maps.service');
const { sendMessageToSocketId } = require('../socket');

module.exports.subscribeToRideRequests = async () => {
    // Ensure RabbitMQ is connected before subscribing? 
    // subscribeToQueue handles connection if not ready, but we established it in server.js

    await rabbitMQ.consumeQueue('ride-requests', async (rideData) => {
        console.log('Processing ride request:', rideData._id);
        try {
            // 1. Get Coordinates
            const pickupCoordinates = await mapService.getAddressCoordinate(rideData.pickup);
            console.log(`Pickup Coordinates for ride ${rideData._id}:`, pickupCoordinates);

            // 2. Get Nearest Captains from Redis
            console.log(`Searching for captains within 5km of ${pickupCoordinates.ltd}, ${pickupCoordinates.lng}...`);
            const captainsInRedis = await redisService.getNearestCaptains(pickupCoordinates.ltd, pickupCoordinates.lng, 5); // 5km radius
            console.log('Captains found in Redis:', captainsInRedis);

            if (!captainsInRedis || captainsInRedis.length === 0) {
                console.log('No captains found nearby for ride:', rideData._id);
                return;
            }

            // 3. Get Captain Details (SocketID) from DB
            // captainsInRedis is [{ member: 'id', distance: '...' }, ...]
            const captainIds = captainsInRedis.map(c => c.member);
            console.log('Captain IDs from Redis:', captainIds);

            const captains = await captainModel.find({
                _id: { $in: captainIds },
                status: 'active' // Only notify active captains
            });
            console.log('Active captains found in DB:', captains.length);
            console.log('Details of active captains found:', captains); // Log the full captains array

            if (captains.length > 0) {
                captains.forEach(c => console.log(`Captain ${c._id} socketId: ${c.socketId}, status: ${c.status}`));
            }

            // 4. Notify Captains
            captains.forEach(captain => {
                if (captain.socketId) {
                    console.log(`Sending new-ride to captain ${captain._id}. Payload user:`, rideData.user);
                    sendMessageToSocketId(captain.socketId, {
                        event: 'new-ride',
                        data: rideData
                    });
                    // Also sending distance info could be nice, but keeping it simple
                }
            });
            console.log(`Notified ${captains.length} captains for ride ${rideData._id}`);

        } catch (error) {
            console.error('Error processing ride request:', error);
            console.error('Error processing ride request:', error);
        }
    });
}

module.exports.confirmRide = async ({ rideId, captainId }) => {
    // 1. Acquire Lock
    // Using simple redis set nx
    // key: lock:ride:{rideId}
    // we can use the redis client directly from service or add a helper
    // let's assume we can import client
    const { client } = require('./redis.service');

    // Attempt to set lock, expire in 5 seconds (enough to process)
    const lockKey = `lock:ride:${rideId}`;
    const result = await client.set(lockKey, captainId.toString(), {
        NX: true,
        EX: 5
    });

    if (!result) {
        throw new Error('Ride already accepted by another captain');
    }

    // 2. Publish Ride Accepted Event
    await rabbitMQ.publishToQueue('ride-accepted', {
        rideId,
        captainId
    });

    return { status: 'processing', message: 'Ride acceptance is being processed' };
}