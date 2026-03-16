const captainModel = require('../models/captain.model');


module.exports.createCaptain = async ({
    firstname, lastname, email, password, color, plate, capacity, vehicleType, model, phone
}) => {
    if (!firstname || !email || !password || !color || !plate || !capacity || !vehicleType || !model || !phone) {
        throw new Error('All fields are required');
    }
    const captain = captainModel.create({
        fullname: {
            firstname,
            lastname
        },
        email,
        password,
        phone,
        vehicle: {
            color,
            plate,
            capacity,
            vehicleType,
            model
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
        console.log('Ride Data Vibe received in Queue:', rideData.vibe);
        try {
            // 1. Get Coordinates
            // rideData.pickup is now an object { address, coordinates: [lng, lat] }
            // So we don't need to geocode again!
            const pickupCoordinates = {
                ltd: rideData.pickup.coordinates[1],
                lng: rideData.pickup.coordinates[0]
            };
            console.log(`Pickup Coordinates for ride ${rideData._id}:`, pickupCoordinates);

            // 2. Get Nearest Captains from Redis
            console.log(`Searching for captains within 5km of ${pickupCoordinates.ltd}, ${pickupCoordinates.lng}...`);
            const captainsInRedis = await redisService.getCaptainsNearby(pickupCoordinates.ltd, pickupCoordinates.lng, 5); // 5km radius
            console.log('Captains found in Redis:', captainsInRedis);

            if (!captainsInRedis || captainsInRedis.length === 0) {
                console.log('No captains found nearby for ride:', rideData._id);
                return;
            }

            // 3. Get Captain Details (SocketID) from DB
            // captainsInRedis is ['id1', 'id2'] (Redis geoSearch returns member strings)
            const captainIds = captainsInRedis;
            console.log('Captain IDs from Redis:', captainIds);

            const captains = await captainModel.find({
                _id: { $in: captainIds },
                isOnline: true 
            });
            console.log('Active captains found in DB:', captains.length);
            console.log('Details of active captains found:', captains); // Log the full captains array

            if (captains.length > 0) {
                captains.forEach(c => console.log(`Captain ${c._id} socketId: ${c.socketId}, status: ${c.status}`));
            }

            // 4. Notify Captains
            // Populate User Details
            // rideData actually comes from rideModel.findOne().populate('rider') in ride.service.js
            // So rideData.rider should already be populated!
            // BUT, rabbitMQ messages are just JSON. 
            // If ride.service.js populated 'rider', then rideData.rider is the user object.
            // Let's rely on that instead of re-querying if possible, or query if missing.
            
            if (!rideData.rider) {
                // If for some reason it's not populated or we are using old logic:
                 rideData.rider = await require('../models/user.model').findById(rideData.rider || rideData.user).select('-password');
            }
            
            // Legacy support for frontend expecting 'user' property?
            // If frontend expects 'ride.user', we might need to map it.
            rideData.user = rideData.rider; 

            captains.forEach(captain => {
                if (captain.socketId) {
                    console.log(`[Diagnostic] Sending new-ride to captain ${captain._id} (${captain.fullname.firstname}) via socket ${captain.socketId}`);
                    
                    // DEEP COPY and FLATTEN the object to match Frontend expectations
                    const rideForFrontend = {
                        ...rideData,
                        pickup: rideData.pickup.address,
                        destination: rideData.drop.address,
                        // NEW FIELDS for Map consistency
                        pickupLocation: {
                            lat: rideData.pickup.coordinates[1],
                            lng: rideData.pickup.coordinates[0]
                        },
                        destinationLocation: {
                            lat: rideData.drop.coordinates[1],
                            lng: rideData.drop.coordinates[0]
                        },
                        fare: rideData.fare.initialBid,
                        user: rideData.rider // Ensure user is populated
                    };

                    sendMessageToSocketId(captain.socketId, {
                        event: 'new-ride',
                        data: rideForFrontend
                    });
                } else {
                    console.warn(`[Diagnostic] Captain ${captain._id} is online but has no socketId recorded!`);
                }
            });
            console.log(`[Diagnostic] Finished notifying ${captains.length} captains for ride ${rideData._id}`);

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