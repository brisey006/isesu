const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },

    gender: {
        type: String,
        required: true,
    },
    cellNumber: {
        type: String,
        required: true,
    },
    dateOfBirth: {
        type: Date,
    },
    address: {
        type: String,
        required: true,
    },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],

    created: {
        type: Date,
        default: Date.now,
    },
});

const Profile = mongoose.model('Profile', ProfileSchema);

module.exports = Profile;