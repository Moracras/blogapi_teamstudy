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
					status: 400,
					content: {
						error: true,
						message: 'Invalid blogId:' + blogId,
					}
				};
			}
			const blog = await BlogPost.findById(blogId).exec();

			if (!blog) {
				// Blog not found
				console.log('Blog post not found:', blogId);
				return {
					status: 404,
					content: {
						error: true,
						message: 'Requested post not found',
					}
				};
			}

			return {
				status: 200,
				content: {
					error: false,
					data: blog.toJSON()
				}
			};
		} catch (err) {
			console.error('Error reading blog post:', err)
			return {
				status: 500,
				content: {
					error: true,
					message: 'Internal Server Error!'
				}
			};
		}

	}

	async PostBlog(data) {
		const response = {
			status: 500,
			content: {
				error: true
			}
		}
		const newBlog = new BlogPost({
			userId: data.userId,
			categoryId: data.categoryId,
			title: data.title,
			message: data.message
		})

		if (data.commentToId) { //Post as Comment
			console.log("Posting Comment...")

			newBlog.commentToId = data.commentToId

			const session = await mongoose.startSession();
			session.startTransaction();

			try {
				await newBlog.save({session})

				const updatedPost = await BlogPost.findByIdAndUpdate(
					data.commentToId,
					{ $push: { comments: newBlog._id } },
					{ new: true, session }
				);

				if (!updatedPost) {
					response.status = 404
					response.content = {
						error: true,
						message: "Original post to comment on was not found with given Id."
					}
					console.log(`Document with id ${data.commentToId} not found to comment on`);
					await session.abortTransaction();
				} else {
					response.status = 200
					response.content = {
						error: false,
					}
					await session.commitTransaction();
				}
				session.endSession();

			} catch (err) {
				await session.abortTransaction();
				session.endSession();
				console.error('Error saving blog post:', err);

				if (err.name === 'ValidationError') {
					response.status = 400
					response.content = {
						error: true,
						message: Object.values(err.errors).map(e => e.message).join(', ')
					}
				} else {
					response.status = 500
					response.content = {
						error: true,
						message: "Internal Server Error"
					}
				}
			}
			

		} else { // Non-Comment Blog Post
			console.log("Creating New Blog Post...")

			await newBlog.save()
				.then(result => {
					console.log('Blog post saved:', result);
					response.status = 200
					response.content = {
						error: false,
					}
				})
				.catch(err => {
					console.error('Error saving blog post:', err);
					if (err.name === 'ValidationError') {
						response.status = 400
						response.content = {
							error: true,
							message: Object.values(err.errors).map(e => e.message).join(', ')
						}
					} else {
						response.status = 500
						response.content = {
							error: true,
							message: "Internal Server Error"
						}
					}
				});
		}
		return response
	}

	async DeleteBlog(blogId) {
		try {
			if (!mongoose.Types.ObjectId.isValid(blogId)) {
				console.log('Invalid blogId:', blogId);
				return {
					status: 400,
					content: {
						error: true,
						message: 'Invalid blogId:' + blogId
					}
				};
			}

			const blog = await BlogPost.findByIdAndDelete(blogId).exec();

			if (!blog) {
				// Blog not found
				console.log('Blog post not found:', blogId);
				return {
					status: 404,
					content: {
						error: true,
						message: 'Blog post to delete not found: ' + blogId
					}
				};
			}

			console.log('Blog post deleted: ', blogId);
			return {
				status: 204
			};
		} catch (err) {
			console.error('Error deleting blog post::', err)
			return {
				status: 500,
				content: {
					error: true,
					message: 'Internal Server Error!'
				}
			};
		}
	}

}

module.exports = new MongoDBBlogHandler()