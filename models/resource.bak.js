const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: true,
    },
    description: {
        type: String,
        required: true,
        index: true,
    },
    rating: {
        type: Number,
        default: 0
    },
    totalNumberOfRatings: {
        type: Number,
        default: 0
    },
    downloads: {
        type: Number,
        default: 0
    },
    approved: {
        type: Boolean,
        default: false,
    },
    fileUrl: {
        type: String,
    },
    fileType: String,
    author: {
        type: String,
        required: true,
    },
    publisher: {
        type: String,
        required: true
    },
    licence: {
        type: String,
        required: true,
    },
    topic: {
        type: String,
        index: true,
        required: true,
    },
    hyperLink: String,
    resourceUse: String,
    levels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Level' }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    topics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    created: {
        type: Date,
        default: Date.now,
    },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Resource = mongoose.model('Resource', ResourceSchema);

module.exports = Resource;
