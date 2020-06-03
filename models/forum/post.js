const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    thread: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    created: {
        type: Date,
        default: Date.now,
    },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    thumbsUp: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ThumbsUp' }],
    thumbsDown: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ThumbsDown' }],
    views: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Views' }],
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

PostSchema.plugin(mongoosePaginate);

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;