//@ts-check
'use strict'

const { ServiceBase } = require("../utilities/servicebase")
const DatabaseHandler = require("./MongoDBBlogHandler")

class BlogService extends ServiceBase {
    static Instance = null

    constructor() {
        super()
        BlogService.Instance = this
        this.Setup()
        
    }

    async Setup() {
        this.router.use(BlogService.Instance.HandleBlogRequest)
        this.router.route("/")
            .get(BlogService.Instance.HandleBlogRead)
            .post(BlogService.Instance.HandleBlogPost)
            .delete(BlogService.Instance.HandleBlogDelete)
        this.router.route("/like")
            .get(BlogService.Instance.HandleLikeCheck)
            .post(BlogService.Instance.HandleLikePost)
            .delete(BlogService.Instance.HandleLikeDelete)
    }

    async HandleBlogRequest(req, res, next) {
        next()
    }

    async HandleBlogRead(req, res) {
        try {
            console.log("Received params to read post: ", req.query)

            if (!req.query.blogId) {
                ServiceBase.SendBadRequestResponse(res, "blogId query is required")
                return
            }

            const blogId = req.query.blogId

            const result = await DatabaseHandler.ReadBlog(blogId)

            if (result.errormessage) {
                if (result.errormessage === "Unknown") {
                    ServiceBase.SendErrorResponse(res)
                } else if (result.errormessage === "NotFound") {
                    ServiceBase.SendNotFoundResponse(res)
                } else {
                    ServiceBase.SendBadRequestResponse(res, result.errormessage)
                }
            } else {
                ServiceBase.SendOkResponse(res, null, result.blog.toJSON())
            }
            
        } catch (err) {
            console.error("Unable to read blog: ", err)
            ServiceBase.SendErrorResponse(res)
        }
    }

    async HandleBlogPost(req, res) {
        try {
            console.log("Received body to post: ", req.body)

            if (!req.body.userId) {
                ServiceBase.SendBadRequestResponse(res, "userId is required")
                return
            }

            if (!req.body.message) {
                ServiceBase.SendBadRequestResponse(res, "message is required")
                return
            }

            const userId = req.body.userId //TODO: Add actual userid when user is present
            const categoryId = req.body.categoryId
            const title = req.body.title
            const message = req.body.message
            let commentToId = null
            if (req.body.commentToId !== undefined) {
                commentToId = req.body.commentToId
            }

            const errormessage = await DatabaseHandler.PostBlog(userId, categoryId, title, message, commentToId)

            if (!errormessage) {
                ServiceBase.SendOkResponse(res, null, null)
            } else if (errormessage == "Unknown") {
                ServiceBase.SendErrorResponse(res)
            } else if (errormessage == "NotFound") {
                ServiceBase.SendNotFoundResponse(res, "Original post to comment on was not found with given Id.")
            } else {
                ServiceBase.SendBadRequestResponse(res, errormessage)
            }
        } catch (err) {
            console.error("Unable to post blog: ", err)
            ServiceBase.SendErrorResponse(res)
        }
    }

    async HandleBlogDelete(req, res) {
        try {
            console.log("Received params to delete post: ", req.query)

            if (!req.query.blogId) {
                ServiceBase.SendBadRequestResponse(res, "blogId query is required")
                return
            }

            const blogId = req.query.blogId

            const authorized = true //TODO: Add actual authorization check

            const result = await DatabaseHandler.DeleteBlog(blogId)

            if (result.errormessage) {
                if (result.errormessage === "Unknown") {
                    ServiceBase.SendErrorResponse(res)
                } else if (result.errormessage === "NotFound") {
                    ServiceBase.SendNotFoundResponse(res)
                } else {
                    ServiceBase.SendBadRequestResponse(res, result.errormessage)
                }
            } else {
                ServiceBase.SendNoContentResponse(res,null,null)
            }
        } catch (err) {
            console.error("Unable to delete blog: ", err)
            ServiceBase.SendErrorResponse(res)
        }
    }

    async HandleLikeCheck(req, res) {
        try {
            console.log("Received params: ", req.query)
            const blogIds = req.query.blogIds
            const userId = 1 //TODO: Add actual check when user is present

            const result = await DatabaseHandler.ReadLikes(blogIds)
            if (result) {
                ServiceBase.SendOkResponse(res, null, result.toJSON())
            } else {
                ServiceBase.SendErrorResponse(res)
            }

        } catch (err) {
            console.error("Unable to read like data: ", err)
            ServiceBase.SendErrorResponse(res)
        }
    }

    async HandleLikePost(req, res) {
        //TODO
    }

    async HandleLikeDelete(req, res) {
        //TODO
    }

}

module.exports = new BlogService()