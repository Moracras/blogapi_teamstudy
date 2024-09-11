//@ts-check
"use strict";

const mongoose = require('mongoose')
const TokenSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true,
    },

    token: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        index: true
    }

}, {
    collection: 'tokens',
    timestamps: true
})