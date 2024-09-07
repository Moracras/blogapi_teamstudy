//@ts-check
'use strict'

const BlogPost = require("./mongoblogpostmodel")
// @ts-ignore
const mongoose = require('mongoose');

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

	async PostBlog(userId, categoryId, title, message, commentToId) {

		const newBlog = new BlogPost({
			userId: userId,
			categoryId: categoryId,
			title: title,
			message: message
		})

		if (commentToId) { //Post as Comment
			console.log("Posting Comment...")

			newBlog.commentToId = commentToId

			const session = await mongoose.startSession();
			session.startTransaction();

			try {
				await newBlog.save({session})

				const updatedPost = await BlogPost.findByIdAndUpdate(
					commentToId,
					{ $push: { comments: newBlog._id } },
					{ new: true, session }
				);

				if (!updatedPost) {
					throw new Error(`Document with id ${commentToId} not found to comment on`);
				}

				await session.commitTransaction();
				session.endSession();

				return true
			} catch (err) {
				await session.abortTransaction();
				session.endSession();

				console.error('Error saving blog post:', err);
			}
			return false

		} else { // Non-Comment Blog Post
			console.log("Creating New Blog Post...")

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