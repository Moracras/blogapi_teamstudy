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

    static SendNoContentResponse(res, details, data) {
        res.status(204).send()
    }

    static SendNotFoundResponse(res, message = "Not Found!") {
        res.status(404).send({
            error: true,
            message: message
        })
    }

    static SendErrorResponse(res) {
        res.status(500).send({
            error: true,
            message: "Internal Server Error!",
        })
    }

    static SendBadRequestResponse(res, message = "Bad Request!") {
        res.status(400).send({
            error: true,
            message: message
        })
    }
}

module.exports = {
    ServiceBase
}