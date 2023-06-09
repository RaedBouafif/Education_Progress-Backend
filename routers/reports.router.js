const {
    reportStudentFromSession,
    reportTeacherFromSession,
    reportGroupsFromSession,
    reportSectionsFromSession,
    getSessionReports,
    reportActors,
    sendMail,
    getAllReports
} = require("../controllers/reports.controller")
const Router = require('express').Router()
const authMiddleWare = require("../middlewares/auth")

Router.route("/reportStudents").post(authMiddleWare(["admin","teacher", "super", "owner"]), reportStudentFromSession)
Router.route("/reportTeacher").post(authMiddleWare(["owner", "admin", "teacher", "super"]), reportTeacherFromSession)
Router.route("/reportGroups").post(authMiddleWare(["owner", "admin", "teacher", "super"]), reportGroupsFromSession)
Router.route("/reportSections").post(authMiddleWare(["owner", "admin", "teacher", "super"]), reportSectionsFromSession)
Router.route("/reportActors").post(authMiddleWare(["owner", "admin", "teacher", "super"]), reportActors)
Router.route("/getReports/:sessionId").get(authMiddleWare(["owner", "admin", "teacher", "super"]), getSessionReports)
Router.route("/getAll").get(authMiddleWare(["owner", "admin", "teacher", "super"]), getAllReports)
Router.route("/sendMail").get(sendMail)


module.exports = Router