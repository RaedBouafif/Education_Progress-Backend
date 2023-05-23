const Router = require('express').Router()
const { saveAbsence, getAllTeachersAbsences, getTeacherAbsences, justifyAbsence, getTeacherAbsencesByYear } = require('../controllers/teacherAbsence.controller')
const authMiddleWare = require("../middlewares/auth")

//------GET---------//
Router.route("/getAllAbsencesByYear/:year").get(authMiddleWare(["admin", "super", "owner", "teacher"]), getAllTeachersAbsences)
Router.route("/getTeacherAbsences/:teacherid").get(authMiddleWare(["admin", "super", "owner", "teacher"]), getTeacherAbsences)
Router.route("/justify/:absenceId").get(authMiddleWare(["admin", "super", "owner"]), justifyAbsence)
Router.route("/getTeacherAbsencesByYear/:teacherid").get(authMiddleWare(["admin", "super", "owner", "teacher"]), getTeacherAbsencesByYear)


//------POST---------//
Router.route("/saveAbsence").post(authMiddleWare(["admin", "super", "owner"]), saveAbsence)


module.exports = Router
