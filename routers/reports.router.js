const {
    reportStudentFromSession,
    reportTeacherFromSession,
    reportGroupsFromSession,
    reportSectionsFromSession,
    sendMail
} = require("../controllers/reports.controller")
const Router = require('express').Router()

Router.route("/reportStudents").post(reportStudentFromSession)
Router.route("/reportTeacher").post(reportTeacherFromSession)
Router.route("/reportGroups").post(reportGroupsFromSession)
Router.route("/reprotSections").post(reportSectionsFromSession)
Router.route("/sendMail").get(sendMail)


module.exports = Router