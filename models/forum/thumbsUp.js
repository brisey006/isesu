const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ThumbsUpSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    created: {
        type: Date,
        default: Date.now,
    },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

ThumbsUpSchema.plugin(mongoosePaginate);

const ThumbsUp = mongoose.model('ThumbsUp', ThumbsUpSchema);

module.exports = ThumbsUp;