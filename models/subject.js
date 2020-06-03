const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        default: Date.now,
    },
    topics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
    resources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
    levels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Level' }],
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Subject = mongoose.model('Subject', SubjectSchema);

module.exports = Subject;