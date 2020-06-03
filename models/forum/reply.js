const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ReplySchema = new mongoose.Schema({
    reply: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reply' }],
    created: {
        type: Date,
        default: Date.now,
    },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

ReplySchema.plugin(mongoosePaginate);

const Reply = mongoose.model('Reply', ReplySchema);

module.exports = Reply;