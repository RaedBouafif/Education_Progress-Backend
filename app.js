const express = require("express")
require("dotenv").config()
const connectDB = require('./config/dbConnect')
const cors = require("cors")
const mongoose = require('mongoose')
const parentRouter = require("./routers/Users/parent.router")
const studentRouter = require("./routers/Users/student.route")
var app = express()

app.use(express.json())
app.use(cors(
    {
        credentials: true,
        origin: 'http://localhost:4000',
        optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    }
))

const baseURL = "/api/v1"


app.use(`${baseURL}/parent`, parentRouter)
app.use(`${baseURL}/student`, studentRouter)




mongoose.set('strictQuery', true)

const start = async () => {
    try {
        await connectDB()
        app.listen(process.env.LISTENPORT, () => {
            console.log("listening on port : " + process.env.LISTENPORT)
        })
    } catch (e) {
        console.log(e)
    }
}

start()