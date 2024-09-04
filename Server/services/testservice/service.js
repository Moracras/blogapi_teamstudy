const { ServiceBase } = require("../utilities/servicebase")

class TestService extends ServiceBase {
    constructor() {
        super()
        this.router.use(this.HandleTestPost)
    }

    async HandleTestPost(req, res) {
        ServiceBase.SendOkResponse(res,null,null)
    }

}

module.exports = new TestService()