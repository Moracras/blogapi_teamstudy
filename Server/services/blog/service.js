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
    }

    async HandleBlogRequest(req, res, next) {
        next()
    }

    async HandleBlogRead(req, res) {
        console.log("Received params: ", req.query)
        try {
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
        console.log("Received body: ",req.body)
        try {
            const userId = req.body.userId
            const categoryId = req.body.categoryId
            const title = req.body.title
            const message = req.body.message

            const success = await DatabaseHandler.PostBlog(userId, categoryId, title, message)

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

}

module.exports = new BlogService()