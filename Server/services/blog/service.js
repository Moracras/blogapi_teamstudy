//@ts-check
'use strict'

const { ServiceBase } = require("../utilities/servicebase")

class BlogService extends ServiceBase {
    constructor() {
        super()
        this.Setup()
    }

    async Setup() {
        this.router.route("/blogtest").get(this.HandleBlogTest)
        this.router.use(this.HandleDefaultPost)
    }

    async HandleDefaultPost(req, res) {
        ServiceBase.SendOkResponse(res, { testdetails: "These are test details" }, {testdata: "This is a test data"})
    }

    async HandleBlogTest(req, res) {
        ServiceBase.SendOkResponse(res, { testdetails: "These are nested test details" }, { testdata: "This is a nested test data" })
    }
}

module.exports = new BlogService()