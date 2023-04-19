const {
    reportStudentFromSession,
    reportTeacherFromSession,
    reportGroupsFromSession,
    reportSectionsFromSession,
    getSessionReports,
    sendMail
} = require("../controllers/reports.controller")
const Router = require('express').Router()

Router.route("/reportStudents").post(reportStudentFromSession)
Router.route("/reportTeacher").post(reportTeacherFromSession)
Router.route("/reportGroups").post(reportGroupsFromSession)
Router.route("/reportSections").post(reportSectionsFromSession)

Router.route("/getReports/:sessionId").get(getSessionReports)
Router.route("/sendMail").get(sendMail)


module.exports = Router