//@ts-check
'use strict'

const mongoose = require('mongoose');

const passwordEncryption = require('./userutilities/passwordEncryption')


const UserSchema = new mongoose.Schema({

    username :{
        type:String,
        trim:true,
        required:true,
        unique:true
    },
    password:{
        type:String,
        trim:true,
        required:true,

        set: (password) => {
            if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password)) {
                return passwordEncryption(password)
            } else {
                throw new Error('Password type is not correct.')
            }

    }  },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        validate: [
            (email) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email),
            'Email type is not correct.'
        ]
    },

    isAdmin : {
        type:Boolean,
        default:false,
    }
    
},
{
    collection: 'users',
    timestamps: true
})

module.exports = mongoose.model('User', UserSchema,'users')