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
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: [5, 'Email must be at least 5 characters long'],
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    socketId: {
        type: String,
    },
    /* SKRRRT Specific Fields */
    rating: {
        type: Number,
        default: 5.0
    },
    vibeProfile: {
        techno: { type: Boolean, default: false },
        quiet: { type: Boolean, default: false },
        ac: { type: Boolean, default: false }
    },
    currentRideId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ride'
    }
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