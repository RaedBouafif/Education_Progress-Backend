const express = require("express")
require("dotenv").config()
const connectDB = require('./config/dbConnect')
const cors = require("cors")
const mongoose = require('mongoose')
const cookieParser = require("cookie-parser")
const bodyParser = require('body-parser')
const parentRouter = require("./routers/Users/parent.router")
const studentRouter = require("./routers/Users/student.router")
const teacherRouter = require("./routers/Users/teacher.router")
const adminRouter = require("./routers/Users/admin.router")
const classroomRouter = require("./routers/classroom.router")
const groupRouter = require("./routers/group.router")
const sectionRouter = require("./routers/section.router")
const plannigRouter = require("./routers/planning.router")
const sessionRouter = require("./routers/session.router")
const subjectRouter = require("./routers/subject.router")
const semesterRouter = require("./routers/semester.router")
const collegeYearRouter = require("./routers/collegeYear.router")
const teacherAbsenceRouter = require("./routers/teacherAbsence.router")
const sessionLogsRouter = require("./routers/sessionLogs.router")
const templateRouter = require("./routers/template.router")
const reportsRouter = require("./routers/reports.router")
const studentPresenceRouter = require("./routers/studentPresence.router")
const messageRouter = require("./routers/message.router")
const notificationRouter = require("./routers/notification.router")
const declaredAbsenceRouter = require("./routers/declarationAbsence.router")
const examenRouter = require("./routers/examen.router")
const eventRouter = require("./routers/evennement.router")
const libraryExamsRouter = require("./routers/libraryExams.router")
const noteRouter = require("./routers/note.router")
const { base } = require("./models/session.model")
var app = express()
app.use(cookieParser())
app.use(express.json({ limit: '50mb' }))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cors(
    {
        credentials: true,
        origin: 'http://localhost:3000',
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
app.use(`${baseURL}/planning`, plannigRouter)
app.use(`${baseURL}/semester`, semesterRouter)
app.use(`${baseURL}/session`, sessionRouter)
app.use(`${baseURL}/collegeYear`, collegeYearRouter)
app.use(`${baseURL}/teacherAbsence`, teacherAbsenceRouter)
app.use(`${baseURL}/sessionLogs`, sessionLogsRouter)
app.use(`${baseURL}/template`, templateRouter)
app.use(`${baseURL}/reports`, reportsRouter)
app.use(`${baseURL}/studentPresence`, studentPresenceRouter)
app.use(`${baseURL}/messaging`, messageRouter)
app.use(`${baseURL}/notification`, notificationRouter)
app.use(`${baseURL}/declaredAbsence`, declaredAbsenceRouter)
app.use(`${baseURL}/examen`, examenRouter)
app.use(`${baseURL}/evennement`, eventRouter)
app.use(`${baseURL}/libraryExams`, libraryExamsRouter)
app.use(`${baseURL}/notes`, noteRouter)

mongoose.set('strictQuery', true)

const start = async () => {
    try {
        await connectDB()
        app.listen(process.env.LISTENPORT, () => {
            console.log("listening on port : " + process.env.LISTENPORT)
        })
    } catch (e) {
        console.log(e.message)
    }
}

start()