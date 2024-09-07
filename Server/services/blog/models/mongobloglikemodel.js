const mongoose = require('mongoose');

const blogLikeSchema = new mongoose.Schema({
    userId: {
        type: Number, //TODO Convert to ObjectId when actual data is retrievable
        required: true
    },
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    isLike: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true,
    collection: 'blogLikes'
});

blogLikeSchema.index({ userId: 1, blogId: 1 }, { unique: true });

const BlogLike = mongoose.model('BlogLike', blogLikeSchema, "blogLikes");

module.exports = BlogLike