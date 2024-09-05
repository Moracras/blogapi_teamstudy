//@ts-check
'use strict'

const BlogPost = require("./mongoblogpostmodel")

class MongoDBBlogHandler {
	constructor() {

	}

	async ReadBlog(blogId) {
		let result = null
		await BlogPost.findById(blogId)
			.then(blog => {
				console.log('Blog post found:', blog);
				result = blog
			})
			.catch(error => {
				console.error('Error finding blog post:', error);
			});
		return result;
	}

	async PostBlog(userId, categoryId, title, message) {
		const newBlog = new BlogPost({
			userId: userId,
			categoryId: categoryId,
			title: title,
			message: message
		})

		let success = false
		await newBlog.save()
			.then(result => {
				console.log('Blog post saved:', result);
				success = true
			})
			.catch(error => {
				console.error('Error saving blog post:', error);
			});
		return success
	}

	async DeleteBlog(blogId) {
		let success = false
		await BlogPost.findByIdAndDelete(blogId)
			.then(blog => {
				console.log('Blog post deleted:', blog);
				success = true
			})
			.catch(error => {
				console.error('Error finding and deleting blog post:', error);
			});
		return success;
	}
}

module.exports = new MongoDBBlogHandler()