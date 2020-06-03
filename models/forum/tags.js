const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const TagSchema = new mongoose.Schema({
    tagName: String,
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    created: {
        type: Date,
        default: Date.now,
    },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

TagSchema.plugin(mongoosePaginate);

const Tag = mongoose.model('Tag', TagSchema);

module.exports = Tag;