const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const CommentSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: true,
    },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    created: {
        type: Date,
        default: Date.now,
    },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

CommentSchema.plugin(mongoosePaginate);

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;