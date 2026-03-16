const rideService = require('../services/ride.service');
const { validationResult } = require('express-validator');
const mapService = require('../services/maps.service');
const { sendMessageToSocketId } = require('../socket');
const rideModel = require('../models/ride.model');

module.exports.createRide = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // ADDED: Accept explicit coordinates from the frontend
    const { userId, pickup, destination, pickupLat, pickupLng, destLat, destLng, vehicleType, vibe, bid } = req.body;
    console.log('createRide params:', { userId, pickup, destination, vehicleType, vibe, bid });
    require('fs').writeFileSync('debug_ride.log', JSON.stringify(req.body, null, 2) + '\n', { flag: 'a' });

    try {
        // Pass coordinates down to the service to bypass geocoding
        const ride = await rideService.createRide({ 
            user: req.user._id, 
            pickup, 
            destination, 
            pickupLat, 
            pickupLng, 
            destLat, 
            destLng,
            vehicleType, 
            vibe, 
            bid 
        });
        
        console.log('Ride created with Vibe:', ride.vibe);
        res.status(201).json(ride);

        // Notification is handled by the distributed Captain Service via RabbitMQ
    } catch (err) {
        if (err.message === 'Unable to fetch coordinates' || err.message === 'Unable to fetch distance and time') {
             return res.status(400).json({ message: err.message });
        }
        next(err);
    }
};

module.exports.getFare = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination } = req.query;

    try {
        const fare = await rideService.getFare(pickup, destination);
        return res.status(200).json(fare);
    } catch (err) {
        if (err.message === 'Unable to fetch coordinates' || err.message === 'Unable to fetch distance and time') {
             return res.status(400).json({ message: err.message });
        }
        next(err);
    }
}

module.exports.confirmRide = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        // Delegating to Captain Service for distributed flow
        const captainService = require('../services/captain.service');
        const result = await captainService.confirmRide({ rideId, captainId: req.captain._id });

        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

module.exports.startRide = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, otp } = req.query;

    try {
        const ride = await rideService.startRide({ rideId, otp, captain: req.captain });
        console.log(ride);

        sendMessageToSocketId(ride.rider.socketId, {
            event: 'ride-started',
            data: ride
        })

        return res.status(200).json(ride);
    } catch (err) {
        next(err);
    }
}

module.exports.endRide = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;
    console.log('End Ride Request received for:', { rideId, captainId: req.captain?._id });

    try {
        const ride = await rideService.endRide({ rideId, captain: req.captain });

        sendMessageToSocketId(ride.rider.socketId, {
            event: 'ride-ended',
            data: ride
        })

        return res.status(200).json(ride);
    } catch (err) {
        next(err);
    }
}
