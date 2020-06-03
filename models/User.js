const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    resources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    password: {
        type: String,
        required: true,
    },
    accountDeleted: {
        type: Number,
        default: 0,
    },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
    created: {
        type: Date,
        default: Date.now,
    },
    userAccessLevel: {
        type: Number,
        default: 7
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: String,
    passwordResetToken: String,
    displayImage: String,
});

UserSchema.index({ username: 'text' });
UserSchema.plugin(mongoosePaginate);

const User = mongoose.model('User', UserSchema);

module.exports = User;