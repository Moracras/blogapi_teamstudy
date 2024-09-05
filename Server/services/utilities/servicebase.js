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
        res.status(204).send({
            error: false,
            message: "No Content",
            details: details,
            data: data
        })
    }

    static SendNotFoundResponse(res) {
        res.status(404).send({
            error: false,
            message: "Not Found!"
        })
    }

    static SendErrorResponse(res) {
        res.status(500).send({
            error: true,
            message: "Internal Server Error!",
        })
    }
}

module.exports = {
    ServiceBase
}