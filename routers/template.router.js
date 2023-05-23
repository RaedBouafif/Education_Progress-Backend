const {
    create,
    addSessionToTemplate,
    getTemplatesByGroupAndCollegeYear,
    getTemplatesByGroup,
    deleteSessionFromTemplate,
    updateSessionFromTemplate,
    getTeacherTemplate,
    getListOfTeachers,
    getAvailableGroups
} = require('../controllers/template.controller')
const Router = require('express').Router()
const authMiddleWare = require("../middlewares/auth")

Router.route("/create").post(authMiddleWare(["admin", "super", "owner"]), create)
Router.route("/addSession").post(authMiddleWare(["admin", "super", "owner"]), addSessionToTemplate)
Router.route("/updateSession").post(authMiddleWare(["admin", "super", "owner"]), updateSessionFromTemplate)
Router.route("/deleteSession/:templateId/:sessionId").delete(authMiddleWare(["admin", "super", "owner"]), deleteSessionFromTemplate)
Router.route("/getAll").get(authMiddleWare(["admin", "super", "owner"]), getTemplatesByGroupAndCollegeYear)
Router.route("/getAllByGroup").post(authMiddleWare(["admin", "super", "owner"]), getTemplatesByGroup)
Router.route("/getTeacherTemplate/:idTeacher/:collegeYear").get(authMiddleWare(["admin", "super", "owner", "teacher"]), getTeacherTemplate)
Router.route("/getListOfTeachersBySection/:idSection").get(authMiddleWare(["admin", "super", "owner", "teacher"]), getListOfTeachers)
Router.route("/availableGroups/:collegeYear/:section/:day/:startsAt/:duration").get(authMiddleWare(["admin", "super", "owner", "teacher"]), getAvailableGroups)

module.exports = Router

