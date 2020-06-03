const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ThumbsDownSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    created: {
        type: Date,
        default: Date.now,
    },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

ThumbsDownSchema.plugin(mongoosePaginate);

const ThumbsDown = mongoose.model('ThumbsDown', ThumbsDownSchema);

module.exports = ThumbsDown;