const captainModel = require('../models/captain.model');
const captainService = require('../services/captain.service');
const blackListTokenModel = require('../models/blackListToken.model');
const { validationResult } = require('express-validator');


module.exports.registerCaptain = async (req, res, next) => {
    try {
        console.log('--- Register Captain Request ---');
        console.log('Body:', req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation Errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { fullname, email, password, vehicle } = req.body;
        console.log('Register Captain Body:', req.body);
        console.log('Errors:', errors.array());

        const isCaptainAlreadyExist = await captainModel.findOne({ email });

        if (isCaptainAlreadyExist) {
            return res.status(400).json({ message: 'Captain already exist' });
        }


        const hashedPassword = await captainModel.hashPassword(password);

        let calculatedCapacity = 4;
        if (vehicle.vehicleType === 'moto') {
            calculatedCapacity = 1;
        } else if (vehicle.vehicleType === 'auto') {
            calculatedCapacity = 3;
        } else if (vehicle.vehicleType === 'mini') {
            calculatedCapacity = 4;
        }

        const captain = await captainService.createCaptain({
            firstname: fullname.firstname,
            lastname: fullname.lastname,
            email,
            password: hashedPassword,
            color: vehicle.color,
            plate: vehicle.plate,
            capacity: calculatedCapacity,
            vehicleType: vehicle.vehicleType,
            vehicleType: vehicle.vehicleType,
            model: vehicle.model,
            phone: req.body.phone
        });

        const token = captain.generateAuthToken();

        res.status(201).json({ token, captain });
    } catch (err) {
        next(err);
    }
}

module.exports.loginCaptain = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const captain = await captainModel.findOne({ email }).select('+password');

        if (!captain) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await captain.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = captain.generateAuthToken();

        res.cookie('token', token);

        res.status(200).json({ token, captain });
    } catch (err) {
        next(err);
    }
}

module.exports.getCaptainProfile = async (req, res, next) => {
    try {
        res.status(200).json({ captain: req.captain });
    } catch (err) {
        next(err);
    }
}

module.exports.logoutCaptain = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[ 1 ];

        if (token) {
            await blackListTokenModel.create({ token });
        }

        res.clearCookie('token');

        res.status(200).json({ message: 'Logout successfully' });
    } catch (err) {
        next(err);
    }
}
module.exports.updateProfile = async (req, res, next) => {
    try {
        const { fullname, phone } = req.body;
        const updates = {};
        if (fullname) updates.fullname = fullname;
        if (phone) updates.phone = phone;

        const captain = await captainModel.findByIdAndUpdate(req.captain._id, updates, { new: true });
        res.status(200).json(captain);
    } catch (err) {
        next(err);
    }
};

module.exports.getHistory = async (req, res, next) => {
    try {
        const history = await rideService.getRideHistory({
            userId: req.captain._id,
            userType: 'captain'
        });
        res.status(200).json(history);
    } catch (err) {
        next(err);
    }
}