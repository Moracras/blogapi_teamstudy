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
            console.log("Received params for like check: ", req.query)
            if (!ServiceBase.MandateQueries(req,res,["blogIds"])) return;

            const blogIds = req.query.blogIds.split(",")

            const userId = 1 //TODO: Add actual check when user is present

            const results = await DatabaseHandler.CheckLikes(userId, blogIds)

            if (results) {
                ServiceBase.SendOkResponse(res, null, results)
            } else {
                ServiceBase.SendErrorResponse(res)
            }

        } catch (err) {
            console.error("Unable to read like data: ", err)
            ServiceBase.SendErrorResponse(res)
        }
    }

    async HandleLikePost(req, res) {
        try {
            console.log("Received data for like/dislike: ", req.body)
            if (!ServiceBase.MandateJsonData(req, res, ["blogId","isLike"])) return;

            const userId = 1 //TODO: Add actual check when user is present

            const currentLikeState = await DatabaseHandler.CheckLikes(userId, [req.body.blogId])

            const responsePayload = await DatabaseHandler.AddLikeOrDislike(userId, currentLikeState[req.body.blogId], req.body)

            ServiceBase.SendResponse(res, responsePayload)

        } catch (err) {
            console.error("Unable to write like/dislike data: ", err)
            ServiceBase.SendErrorResponse(res)
        }
    }

    async HandleLikeDelete(req, res) {
        try {
            console.log("Received data for like/dislike removal: ", req.query)
            if (!ServiceBase.MandateQueries(req, res, ["blogId"])) return;

            const userId = 1 //TODO: Add actual check when user is present

            const currentLikeState = await DatabaseHandler.CheckLikes(userId, [req.query.blogId])

            const responsePayload = await DatabaseHandler.RemoveLikeOrDislike(userId, currentLikeState[req.query.blogId], req.query.blogId)

            ServiceBase.SendResponse(res, responsePayload)

        } catch (err) {
            console.error("Unable to remove like/dislike data: ", err)
            ServiceBase.SendErrorResponse(res)
        }
    }

}

module.exports = new BlogService()