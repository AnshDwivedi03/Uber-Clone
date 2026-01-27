const mongoose = require('mongoose');
const rideService = require('./services/ride.service');
const rabbitMQ = require('./services/rabbitmq.service');
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');
const rideModel = require('./models/ride.model');
const mapService = require('./services/maps.service'); // might be needed if creating ride
require('dotenv').config();

const fs = require('fs');

const logFile = './debugging.log';
// Clear previous log
fs.writeFileSync(logFile, '');

const originalLog = console.log;
const originalError = console.error;

console.log = (...args) => {
    fs.appendFileSync(logFile, args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : a)).join(' ') + '\n');
    originalLog(...args);
};

console.error = (...args) => {
    fs.appendFileSync(logFile, 'ERROR: ' + args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : a)).join(' ') + '\n');
    originalError(...args);
};

async function run() {
    console.log('--- Starting Debug Script ---');

    // 1. Connect to MongoDB
    try {
        await mongoose.connect(process.env.DB_CONNECT);
        console.log('DB Connected');
    } catch (err) {
        console.error('DB Connection Failed', err);
        return;
    }

    // 2. Connect to RabbitMQ (via service)
    try {
        await rabbitMQ.connect();
        console.log('RabbitMQ Connected');
    } catch (err) {
        console.error('RabbitMQ Connection Failed', err);
        return;
    }

    // 3. Start Consumer
    await rideService.subscribeToRideAccepted();
    console.log('Consumer Subscribed');

    // 4. Create Test Data
    const suffix = Date.now();

    // User
    const user = await userModel.create({
        fullname: { firstname: 'Debug', lastname: 'User' },
        email: `debuguser${suffix}@test.com`,
        password: 'password123',
        socketId: 'socket_user_' + suffix
    });
    console.log('Test User Created:', user._id);

    // Captain
    const captain = await captainModel.create({
        fullname: { firstname: 'Debug', lastname: 'Captain' },
        email: `debugcaptain${suffix}@test.com`,
        password: 'password123',
        status: 'active',
        vehicle: { color: 'Red', plate: 'D-123', capacity: 4, vehicleType: 'moto' },
        location: { lat: 12.9716, lng: 77.5946 },
        socketId: 'socket_captain_' + suffix
    });
    console.log('Test Captain Created:', captain._id);

    // Ride
    const ride = await rideModel.create({
        user: user._id,
        pickup: 'Test Pickup',
        destination: 'Test Destination',
        fare: 100,
        status: 'pending',
        otp: '123456'
    });
    console.log('Test Ride Created:', ride._id);

    // 5. Simulate Ride Acceptance Event
    console.log('Publishing ride-accepted event...');
    await rabbitMQ.publishToQueue('ride-accepted-debug', {
        rideId: ride._id,
        captainId: captain._id
    });

    // 6. Wait for logs
    console.log('Waiting for consumer to process...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('Cleaning up...');
    await rideModel.deleteOne({ _id: ride._id });
    await userModel.deleteOne({ _id: user._id });
    await captainModel.deleteOne({ _id: captain._id });

    // rabbitMQ close?
    // mongoose close?
    console.log('Done.');
    process.exit(0);
}

run();
