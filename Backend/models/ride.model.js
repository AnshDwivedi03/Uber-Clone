const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    rider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'captain'
    },
    status: {
        type: String,
        enum: ['requested', 'bidding', 'accepted', 'ongoing', 'completed', 'cancelled'],
        default: 'requested'
    },
    pickup: {
        address: { type: String, required: true },
        coordinates: {
            type: [Number], // [lng, lat]
            required: true
        }
    },
    drop: {
        address: { type: String, required: true },
        coordinates: {
            type: [Number], // [lng, lat]
            required: true
        }
    },
    fare: {
        initialBid: { type: Number, required: true },
        finalFare: { type: Number },
        currency: { type: String, default: 'INR' }
    },
    vibe: {
        music: { type: Boolean, default: false },
        quiet: { type: Boolean, default: false },
        ac: { type: Boolean, default: false }
    },
    otp: {
        type: String,
        select: false
    },
    paymentId: {
        type: String,
    },
    orderId: {
        type: String,
    },
    signature: {
        type: String,
    },
    distance: {
        type: Number // in meters or km
    },
    duration: {
        type: Number // in seconds or minutes
    },
    routePolyline: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('ride', rideSchema);