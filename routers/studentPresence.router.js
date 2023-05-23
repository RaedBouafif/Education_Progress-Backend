const Router = require('express').Router()
const { saveStudentPresence, saveStudentAbsence, getStudentPresencesByYear, justifyAbsence, getStudentsAbsenceAndPresence } = require('../controllers/studentPresence.controller')
const authMiddleWare = require("../middlewares/auth")

//------GET---------//
Router.route("/getStudentsPresenceAndAbsence/:sessionId").get(authMiddleWare(["admin", "owner", "teacher", "super"]), getStudentsAbsenceAndPresence)



//------POST---------//
Router.route("/saveStudentPresence").post(authMiddleWare(["admin", "owner", "teacher", "super"]), saveStudentPresence)
Router.route("/saveStudentAbsence").post(authMiddleWare(["admin", "owner", "teacher", "super"]), saveStudentAbsence)

module.exports = Router
