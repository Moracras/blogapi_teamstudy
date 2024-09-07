//@ts-check

class ServiceBase {
    constructor() {
        this.router = require('express').Router()
    }

    GetRouter() {
        return this.router;
    }

    /**
     * 
     * Sends a response package with 200 response code
     * 
     * @param {import('express').Response} res
     * @param {{}} details
     * @param {{}} data
     */
    static SendOkResponse(res, details, data) {
        res.status(200).send({
            error: false,
            message: "OK!",
            details: details,
            data: data
        })
    }

    /**
     * 
     * Sends a response package with 204 response code
     * 
     * @param {import('express').Response} res
     */
    static SendNoContentResponse(res) {
        res.status(204).send()
    }

    /**
     * 
     * Sends a response package with 404 response code
     * 
     * @param {import('express').Response} res
     */
    static SendNotFoundResponse(res, message = "Not Found!") {
        res.status(404).send({
            error: true,
            message: message
        })
    }

    /**
     * 
     * Sends a response package with 500 response code
     * 
     * @param {import('express').Response} res
     */
    static SendErrorResponse(res, message = "Internal Server Error!") {
        res.status(500).send({
            error: true,
            message: message,
        })
    }

    /**
     * 
     * Sends a response package with 400 response code
     * 
     * @param {import('express').Response} res
     */
    static SendBadRequestResponse(res, message = "Bad Request!") {
        res.status(400).send({
            error: true,
            message: message
        })
    }

    /**
     * 
     * Automatically sends response packages according to given payload
     * status field in payload decides what status code to send
     * content field in payload is direcly sent along with response package as body
     * 
     * @param {import('express').Response} res
     * @param {{ status: number; content?: {}; }} responsePayload
     */
    static SendResponse(res, responsePayload) {
        if (responsePayload.status == 204) {
            ServiceBase.SendNoContentResponse(res)
            return;
        }

        res.status(responsePayload.status).send(responsePayload.content)
    }

    /**
     * 
     * Mandates query fields in incoming package, automatically sends BadRequest response if mandated queries are missing
     * Returns true if no problems are found
     * 
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {string[]} queries
     * @returns {boolean}
     */
    static MandateQueries(req, res, queries) {
        const missingQueries = queries.filter((/** @type {string | number} */ query) => !req.query[query]);

        if (missingQueries.length > 0) {
            ServiceBase.SendBadRequestResponse(res, `Missing required queries: ${missingQueries.join(', ')}`)
            return false
        }

        return true
    }

    /**
     * 
     * Mandates given data fields in incoming package, automatically sends BadRequest response if data is missing
     * Returns true if no problems are found
     * 
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {string[]} data
     * 
     */
    static MandateJsonData(req, res, data) {
        const missingData = data.filter((prop) => !req.body[prop]);

        if (missingData.length > 0) {
            ServiceBase.SendBadRequestResponse(res, `Missing required data: ${missingData.join(', ')}`)
            return false
        }

        return true
    }
}

module.exports = {
    ServiceBase
}