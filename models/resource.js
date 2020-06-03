const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ResourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
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
        required: true,
    },
    hyperLink: String,
    thumbnail: String,
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

ResourceSchema.plugin(mongoosePaginate);

ResourceSchema.index({ title: 'text', description: 'text', author: 'text', topic: 'text' });

const Resource = mongoose.model('Resource', ResourceSchema);

module.exports = Resource;