const express = require("express")
require("dotenv").config()
const connectDB = require('./config/dbConnect')
const cors = require("cors")
const mongoose = require('mongoose')
const parentRouter = require("./routers/Users/parent.router")
const studentRouter = require("./routers/Users/student.router")
const teacherRouter = require("./routers/Users/teacher.router")
const adminRouter = require("./routers/Users/admin.router")
const classroomRouter = require("./routers/classroom.router")
const groupRouter = require("./routers/group.router")
const sectionRouter = require("./routers/section.router")
const sessionRouter = require("./routers/session.router")

const subjectRouter = require("./routers/subject.router")
const { base } = require("./models/session.model")
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
app.use(`${baseURL}/teacher`, teacherRouter)
app.use(`${baseURL}/admin`, adminRouter)
app.use(`${baseURL}/subject`, subjectRouter)
app.use(`${baseURL}/classroom`, classroomRouter)
app.use(`${baseURL}/section`, sectionRouter)
app.use(`${baseURL}/group`, groupRouter)
app.use(`${baseURL}/session`, sessionRouter)


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