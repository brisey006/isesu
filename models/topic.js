const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    level: { type: mongoose.Schema.Types.ObjectId, ref: 'Level' },
    created: {
        type: Date,
        default: Date.now,
    },
    competences: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Competence' }],
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Topic = mongoose.model('Topic', TopicSchema);

module.exports = Topic;