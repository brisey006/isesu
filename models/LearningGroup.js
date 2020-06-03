const mongoose = require('mongoose');

const LearningGroupSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    levels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Level' }],
    created: {
        type: Date,
        default: Date.now,
    },
    creator: {
        type: String,
        required: true
    }
});

const LearningGroup = mongoose.model('LearningGroup', LearningGroupSchema);

module.exports = LearningGroup;