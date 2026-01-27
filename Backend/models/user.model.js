const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const userSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true,
            minlength: [3, 'First name must be at least 3 characters long'],
        },
        lastname: {
            type: String,
            minlength: [3, 'Last name must be at least 3 characters long'],
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: [5, 'Email must be at least 5 characters long'],
    },
    // Adding phone for OTP login flow
    phone: {
        type: String,
        required: false, // Can make true once we fully switch to phone auth
        unique: true,
        sparse: true, // Allows null/unique
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    /* SKRRRT Specific Fields */
    rating: {
        type: Number,
        default: 5.0
    },
    vibeProfile: {
        music: { type: Boolean, default: false },
        quiet: { type: Boolean, default: false },
        ac: { type: Boolean, default: false }
    },
    currentRideId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ride'
    },
    socketId: {
        type: String,
    },
})
// for single user
userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return token;
}

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}
// for all here there is no specific user
userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
}

const userModel = mongoose.model('user', userSchema);


module.exports = userModel;