class ServiceBase {
    constructor() {
        this.router = require('express').Router()
    }

    GetRouter() {
        return this.router;
    }

    static SendOkResponse(res, details, data) {
        res.status(200).send({
            error: false,
            message: "OK!",
            details: details,
            data: data
        })
    }
}

module.exports = {
    ServiceBase
}