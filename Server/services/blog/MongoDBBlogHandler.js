//@ts-check
'use strict'

const BlogPost = require("./mongoblogpostmodel")
// @ts-ignore
const mongoose = require('mongoose');

class MongoDBBlogHandler {
	constructor() {

	}

	async ReadBlog(blogId) {
		try {
			if (!mongoose.Types.ObjectId.isValid(blogId)) {
				console.log('Invalid blogId:', blogId);
				return {
					errormessage: 'Invalid blogId:' + blogId,
				};
			}
			const blog = await BlogPost.findById(blogId).exec();

			if (!blog) {
				// Blog not found
				console.log('Blog post not found:', blogId);
				return {
					errormessage: "NotFound",
				};
			}

			return {
				blog: blog
			};
		} catch (err) {
			console.error('Error reading blog post:', err)
			return {
				errormessage: "Unknown",
			}
		}

	}

	async PostBlog(userId, categoryId, title, message, commentToId) {
		let errormessage = "Unknown"
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
					errormessage = "NotFound"
					console.log(`Document with id ${commentToId} not found to comment on`);
					await session.abortTransaction();
				} else {
					errormessage = null
					await session.commitTransaction();
				}
				session.endSession();

			} catch (err) {
				await session.abortTransaction();
				session.endSession();
				console.error('Error saving blog post:', err);

				if (err.name === 'ValidationError') {
					errormessage = Object.values(err.errors).map(e => e.message).join(', ');
				} 
			}
			

		} else { // Non-Comment Blog Post
			console.log("Creating New Blog Post...")

			await newBlog.save()
				.then(result => {
					console.log('Blog post saved:', result);
					errormessage = null
				})
				.catch(error => {
					console.error('Error saving blog post:', error);
					if (error.name === 'ValidationError') {
						errormessage = Object.values(error.errors).map(e => e.message).join(', ');
					} 
				});
		}
		return errormessage
	}

	async DeleteBlog(blogId) {
		try {
			if (!mongoose.Types.ObjectId.isValid(blogId)) {
				console.log('Invalid blogId:', blogId);
				return {
					errormessage: 'Invalid blogId:' + blogId,
				};
			}

			const blog = await BlogPost.findByIdAndDelete(blogId).exec();

			if (!blog) {
				// Blog not found
				console.log('Blog post not found:', blogId);
				return {
					errormessage: "NotFound",
				};
			}

			console.log('Blog post deleted: ', blogId);
			return {};
		} catch (err) {
			console.error('Error deleting blog post::', err)
			return {
				errormessage: "Unknown",
			}
		}
	}
}

module.exports = new MongoDBBlogHandler()