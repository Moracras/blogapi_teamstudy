'use strict'

const session = require('cookie-session')
const express = require('express')
const app = express()
require('dotenv').config()

const PORT = process.env.PORT || 8000
const HOST = process.env.HOST || '127.0.0.1'


app.use(session({
    secret: process.env.SECRET_KEY, // Şifreleme anahtarı
    // maxAge: 1000 * 60 * 60 * 24 * 3  // miliseconds // 3 days
}))


app.all('/',(req,res)=>{
    res.send({
        error:false,
        message:"WELCOME TO BLOG API"
    })
})
app.listen(PORT,()=>console.log(`Server is running on http://${HOST}:${PORT}`))