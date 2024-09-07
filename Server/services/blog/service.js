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

            if (!ServiceBase.MandateQueries(req, res, ["blogId"])) return;

            const responsePayload = await DatabaseHandler.ReadBlog(req.query.blogId)

            ServiceBase.SendResponse(res, responsePayload)
            
        } catch (err) {
            console.error("Unable to read blog: ", err)
            ServiceBase.SendErrorResponse(res)
        }
    }

    async HandleBlogPost(req, res) {
        try {
            console.log("Received body to post: ", req.body)

            if (!ServiceBase.MandateJsonData(req, res, ["userId", "message"])) return;

            const responsePayload = await DatabaseHandler.PostBlog(req.body)

            ServiceBase.SendResponse(res, responsePayload)

        } catch (err) {
            console.error("Unable to post blog: ", err)
            ServiceBase.SendErrorResponse(res)
        }
    }

    async HandleBlogDelete(req, res) {
        try {
            console.log("Received params to delete post: ", req.query)

            if (!ServiceBase.MandateQueries(req, res, ["blogId"])) return;

            const authorized = true //TODO: Add actual authorization check

            const responsePayload = await DatabaseHandler.DeleteBlog(req.query.blogId)

            ServiceBase.SendResponse(res, responsePayload)

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