const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
    userId: {
        type: Number,
        required: true
    },
    categoryId: {
        type: Number, 
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    collection: 'blogPosts' 
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema, "blogPosts");

module.exports = BlogPost