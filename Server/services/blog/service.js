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
            console.log("Received params: ", req.query)
            const blogId = req.query.blogId

            const result = await DatabaseHandler.ReadBlog(blogId)
            if (result) {
                ServiceBase.SendOkResponse(res, null, result.toJSON())
            } else {
                ServiceBase.SendErrorResponse(res)
            }
            
        } catch (err) {
            console.error("Unable to read blog: ", err)
            ServiceBase.SendErrorResponse(res)
        }
    }

    async HandleBlogPost(req, res) {
        try {
            console.log("Received body: ", req.body)
            const userId = req.body.userId
            const categoryId = req.body.categoryId
            const title = req.body.title
            const message = req.body.message
            let commentToId = null
            if (req.body.commentToId !== undefined) {
                commentToId = req.body.commentToId
            }

            const success = await DatabaseHandler.PostBlog(userId, categoryId, title, message, commentToId)

            if (success) {
                ServiceBase.SendOkResponse(res, null, null)
            } else {
                ServiceBase.SendErrorResponse(res)
            }
        } catch (err) {
            console.error("Unable to post blog: ", err)
            ServiceBase.SendErrorResponse(res)
        }
    }

    async HandleBlogDelete(req, res) {
        try {
            const blogId = req.query.blogId

            const authorized = true //TODO: Add actual authorization check

            const success = await DatabaseHandler.DeleteBlog(blogId)

            if (success) {
                ServiceBase.SendNoContentResponse(res,null,null)
            } else {
                ServiceBase.SendNotFoundResponse(res)
            }
        } catch (err) {
            console.error("Unable to delete blog: ", err)
            ServiceBase.SendErrorResponse(res)
        }
    }

    async HandleLikeCheck(req, res) {
        //TODO
    }

    async HandleLikePost(req, res) {
        //TODO
    }

    async HandleLikeDelete(req, res) {
        //TODO
    }

}

module.exports = new BlogService()