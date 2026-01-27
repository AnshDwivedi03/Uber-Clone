const rideModel = require('../models/ride.model');
const mapService = require('./maps.service');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

async function getFare(pickup, destination) {

    if (!pickup || !destination) {
        throw new Error('Pickup and destination are required');
    }

    const distanceTime = await mapService.getDistanceTime(pickup, destination);

    const baseFare = {
        auto: 30,
        car: 50,
        moto: 20
    };

    const perKmRate = {
        auto: 10,
        car: 15,
        moto: 8
    };

    const perMinuteRate = {
        auto: 2,
        car: 3,
        moto: 1.5
    };



    const fare = {
        auto: Math.round(baseFare.auto + ((distanceTime.distance.value / 1000) * perKmRate.auto) + ((distanceTime.duration.value / 60) * perMinuteRate.auto)),
        car: Math.round(baseFare.car + ((distanceTime.distance.value / 1000) * perKmRate.car) + ((distanceTime.duration.value / 60) * perMinuteRate.car)),
        moto: Math.round(baseFare.moto + ((distanceTime.distance.value / 1000) * perKmRate.moto) + ((distanceTime.duration.value / 60) * perMinuteRate.moto))
    };

    return fare;


}

module.exports.getFare = getFare;


function getOtp(num) {
    function generateOtp(num) {
        const otp = crypto.randomInt(Math.pow(10, num - 1), Math.pow(10, num)).toString();
        return otp;
    }
    return generateOtp(num);
}


module.exports.createRide = async ({
    user, pickup, destination, vehicleType
}) => {
    if (!user || !pickup || !destination || !vehicleType) {
        throw new Error('All fields are required');
    }

    const fare = await getFare(pickup, destination);



    const ride = await rideModel.create({
        user,
        pickup,
        destination,
        otp: getOtp(6),
        fare: fare[vehicleType]
    })

    // Publish to RabbitMQ
    const rabbitMQ = require('./rabbitmq.service');

    // We need to populate the user details for the frontend to display them
    const rideWithUser = await rideModel.findOne({ _id: ride._id }).populate('user');
    console.log('Publishing ride to RabbitMQ:', JSON.stringify(rideWithUser, null, 2));

    await rabbitMQ.publishToQueue('ride-requests', rideWithUser);

    return ride;
}

module.exports.confirmRide = async ({
    rideId, captain
}) => {
    if (!rideId) {
        throw new Error('Ride id is required');
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    }, {
        status: 'accepted',
        captain: captain._id
    })

    const ride = await rideModel.findOne({
        _id: rideId
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    return ride;

}

module.exports.startRide = async ({ rideId, otp, captain }) => {
    if (!rideId || !otp) {
        throw new Error('Ride id and OTP are required');
    }

    const ride = await rideModel.findOne({
        _id: rideId
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    if (ride.status !== 'accepted') {
        throw new Error('Ride not accepted');
    }

    if (ride.otp !== otp) {
        throw new Error('Invalid OTP');
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    }, {
        status: 'ongoing'
    })

    return ride;
}

module.exports.endRide = async ({ rideId, captain }) => {
    if (!rideId) {
        throw new Error('Ride id is required');
    }

    const ride = await rideModel.findOne({
        _id: rideId,
        captain: captain._id
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    if (ride.status !== 'ongoing') {
        throw new Error('Ride not ongoing');
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    }, {
        status: 'completed'
    })

    return ride;
}

// Subscribe to Ride Accepted Events
module.exports.subscribeToRideAccepted = async () => {
    const rabbitMQ = require('./rabbitmq.service');
    const { sendMessageToSocketId } = require('../socket'); // check path?

    await rabbitMQ.consumeQueue('ride-accepted', async (data) => {
        console.log('Processing ride acceptance:', data);
        const { rideId, captainId } = data;

        try {
            const ride = await rideModel.findOne({ _id: rideId });
            if (!ride || ride.status !== 'pending') {
                // Might have been accepted already if lock failed or logic split
                console.log('Ride not available or already accepted');
                return;
            }

            // Update DB
            await rideModel.findOneAndUpdate({
                _id: rideId
            }, {
                status: 'accepted',
                captain: captainId
            })

            const rideWithDetails = await rideModel.findOne({
                _id: rideId
            }).populate('user').populate('captain').select('+otp');

            // Notify User
            if (rideWithDetails.user && rideWithDetails.user.socketId) {
                console.log(`Sending ride-confirmed to user ${rideWithDetails.user._id} at socket ${rideWithDetails.user.socketId}`);
                console.log('Ride details sent to user (OTP check):', rideWithDetails.otp);
                // console.log('Full ride details:', JSON.stringify(rideWithDetails, null, 2));
                sendMessageToSocketId(rideWithDetails.user.socketId, {
                    event: 'ride-confirmed',
                    data: rideWithDetails
                });
            } else {
                console.log('User socketId not found for ride:', rideId);
            }

            // Notify Captain? (The one who accepted)
            if (rideWithDetails.captain && rideWithDetails.captain.socketId) {
                console.log(`Sending ride-confirmed to captain ${rideWithDetails.captain._id} at socket ${rideWithDetails.captain.socketId}`);
                sendMessageToSocketId(rideWithDetails.captain.socketId, {
                    event: 'ride-confirmed',
                    data: rideWithDetails
                });
            }

        } catch (error) {
            console.error('Error processing ride acceptance:', error);
        }
    });
}

