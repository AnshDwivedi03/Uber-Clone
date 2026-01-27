const mongoose = require('mongoose');
const captainModel = require('./models/captain.model');
require('dotenv').config();

const migrateCaptains = async () => {
    try {
        await mongoose.connect(process.env.DB_CONNECT);
        console.log('Connected to DB');

        const result = await captainModel.updateMany(
            { 'vehicle.vehicleType': 'car' },
            { $set: { 'vehicle.vehicleType': 'mini', 'vehicle.capacity': 4 } }
        );

        console.log(`Migration complete. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed', err);
        process.exit(1);
    }
};

migrateCaptains();
