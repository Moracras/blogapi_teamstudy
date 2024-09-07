const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
    userId: {
        type: Number, //TODO Convert to ObjectId when actual data is retrievable
        required: true
    },
    categoryId: {
        type: Number, //TODO Convert to ObjectId when actual data is retrievable
    },
    comments: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true,
        index: true
    },
    commentToId: {
        type: mongoose.Schema.Types.ObjectId
    },
    title: {
        type: String,
    },
    message: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    },

}, {
    timestamps: true,
    collection: 'blogPosts' 
});

blogPostSchema.pre('validate', function (next) {
    const hasCategoryId = this.categoryId != null;
    const hasTitle = this.title != null;
    const hasCommentToId = this.commentToId != null;

    if (
        (hasTitle && hasCategoryId && !hasCommentToId) ||
        (!hasTitle && !hasCategoryId && hasCommentToId)
    ) {
        // Valid cases
        next();
    } else {
        // Invalid cases
        if (hasTitle || hasCategoryId) {
            if (hasCommentToId) {
                this.invalidate('commentToId', 'If commentToId is provided, title and categoryId must not be present.');
            } else {
                this.invalidate('categoryId', 'title and categoryId must both be present.');
                this.invalidate('title', 'title and categoryId must both be present.');
            }
        } else {
            this.invalidate('categoryId', 'Either title and categoryId or commentToId is required.');
            this.invalidate('title', 'Either title and categoryId or commentToId is required.');
            this.invalidate('commentToId', 'Either title and categoryId or commentToId is required.');
        }
        next();
    }
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema, "blogPosts");

module.exports = BlogPost