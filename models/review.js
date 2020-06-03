const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: true,
    },
    rating: Number,
    resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
    created: {
        type: Date,
        default: Date.now,
    },
    creator: {
        type: String,
        required: true
    }
});

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;