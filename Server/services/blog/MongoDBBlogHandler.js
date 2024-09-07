//@ts-check
'use strict'

const BlogPost = require("./models/mongoblogpostmodel")
const BlogLike = require("./models/mongobloglikemodel")
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
				await newBlog.save({ session })

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

			} catch (err) {
				await session.abortTransaction();

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
			} finally {
				session.endSession();
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

	async CheckLikes(userId, blogIds) {

		const results = {}

		try {
			const validBlogIds = [];

			for (const blogId of blogIds) {

				if (!mongoose.Types.ObjectId.isValid(blogId)) {
					console.log('Invalid blogId:', blogId);
					results[blogId] = {
						success: false,
						message: "Invalid blogId"
					}
					continue
				} else {
					validBlogIds.push(blogId)
				}
			}

			const likedBlogs = await BlogLike.find({
				userId: userId,
				blogId: { $in: validBlogIds }
			}).exec();

			likedBlogs.forEach(likedata => {
				results[likedata.blogId] = {
					success: true,
					liked: true,
					isLike: likedata.isLike
				};
			});

			validBlogIds.forEach(id => {
				if (!results[id]) {
					results[id] = {
						success: true,
						liked: false
					};
				}
			});

			return results

		} catch (err) {
			console.error('Error reading like data:', err)
			
			return null
		}
	}

	async AddLikeOrDislike(userId, currentLikeState, data) {
		const blogId = data.blogId
		const isLike = data.isLike

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

		if (currentLikeState.liked && currentLikeState.isLike === isLike) {
			console.log(`User [${userId}] already liked/disliked: ${blogId}`);
			return {
				status: 200,
				content: {
					error: false,
					message: `User [${userId}] already liked/disliked: ${blogId}`
				}
			};
		}

		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			//fix previous like/dislike
			const post = await BlogPost.findById(blogId).exec()

			if (!post) {
				console.error('Post to like/dislike not found: ', blogId);
				await session.abortTransaction();

				return {
					status: 404,
					content: {
						error: true,
						message: 'Post to like/dislike not found: ' + blogId
					}
				}
			}

			if (currentLikeState.liked) {
				if (currentLikeState.isLike) {
					post.likes -= 1
				} else {
					post.dislikes -= 1
				}
			}

			if (isLike) {
				post.likes += 1
			} else {
				post.dislikes += 1
			}

			await post.save({ session })

			//write like/dislike data

			if (currentLikeState.liked) {
				const likeData = await BlogLike.findOne({ blogId: blogId, userId: userId }).exec()

				if (!likeData) {
					await session.abortTransaction();

					return {
						status: 404,
						content: {
							error: true,
							message: 'Like data not found.'
						}
					};
				}

				likeData.isLike = isLike

				await likeData.save({ session })
			} else {
				const newLike = new BlogLike({
					userId: userId,
					blogId: blogId,
					isLike: isLike
				})

				await newLike.save({ session })
			}

			await session.commitTransaction();

			return {
				status: 200,
				content: {
					error: false,
				}
			}
		} catch (err) {
			await session.abortTransaction();
			
			console.error('Error saving like/dislike data:', err);
			return {
				status: 500,
				content: {
					error: true,
					message: 'Internal Server Error!'
				}
			};
		} finally {
			session.endSession();
		}
	}

	async RemoveLikeOrDislike(userId, currentLikeState, blogId) {
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

		if (!currentLikeState.liked) {
			console.log(`User [${userId}] did not like/dislike: ${blogId}`);
			return {
				status: 200,
				content: {
					error: false,
					message: `User [${userId}] did not like/dislike: ${blogId}`
				}
			};
		}

		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			const post = await BlogPost.findById(blogId).exec()

			if (!post) {
				console.error('Post to remove like/dislike not found: ', blogId);
				await session.abortTransaction();

				return {
					status: 404,
					content: {
						error: true,
						message: 'Post to remove like/dislike not found: ' + blogId
					}
				}
			}

			if (currentLikeState.isLike) {
				post.likes -= 1
			} else {
				post.dislikes -= 1
			}


			await post.save({ session })

			//remove like/dislike data

			const likeData = await BlogLike.findOneAndDelete({ blogId: blogId, userId: userId }).session(session).exec()

			if (!likeData) {
				await session.abortTransaction();

				return {
					status: 404,
					content: {
						error: true,
						message: 'Like data not found.'
					}
				};
			}

			await session.commitTransaction();


			return {
				status: 200,
				content: {
					error: false,
				}
			}
		} catch (err) {
			await session.abortTransaction();
			
			console.error('Error saving like/dislike data:', err);
			return {
				status: 500,
				content: {
					error: true,
					message: 'Internal Server Error!'
				}
			};
		} finally {
			session.endSession();
		}
	}
}

module.exports = new MongoDBBlogHandler()