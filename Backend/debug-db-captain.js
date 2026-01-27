const mongoose = require('mongoose');
const captainModel = require('./models/captain.model');
require('dotenv').config();

const debugCaptainStatus = async () => {
    try {
        await mongoose.connect(process.env.DB_CONNECT);
        console.log('Connected to DB');

        // Fetch all captains to see their status
        const captains = await captainModel.find({});
        console.log(`Found ${captains.length} captains in DB:`);
        
        captains.forEach(c => {
            console.log(`- ID: ${c._id}`);
            console.log(`  Name: ${c.fullname.firstname} ${c.fullname.lastname}`);
            console.log(`  Email: ${c.email}`);
            console.log(`  isOnline: ${c.isOnline} (Type: ${typeof c.isOnline})`);
            console.log(`  Status: ${c.status}`);
            console.log(`  Vehicle: ${c.vehicle.vehicleType} (Capacity: ${c.vehicle.capacity})`);
            console.log('---');
        });

        process.exit(0);
    } catch (err) {
        console.error('Debug failed', err);
        process.exit(1);
    }
};

debugCaptainStatus();
