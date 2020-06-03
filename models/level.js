const mongoose = require('mongoose');

const LevelSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningGroup' },
    created: {
        type: Date,
        default: Date.now,
    },
    subjects: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Level = mongoose.model('Level', LevelSchema);

module.exports = Level;