const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ViewsSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    created: {
        type: Date,
        default: Date.now,
    },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

ViewsSchema.plugin(mongoosePaginate);

const Views = mongoose.model('Views', ViewsSchema);

module.exports = Views;