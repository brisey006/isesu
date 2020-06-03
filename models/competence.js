const mongoose = require('mongoose');

const CompetenceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        default: Date.now,
    },
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    level: { type: mongoose.Schema.Types.ObjectId, ref: 'Level' },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Competence = mongoose.model('Competence', CompetenceSchema);

module.exports = Competence;