const Router = require('express').Router()
const { saveStudentPresence, saveStudentAbsence, getStudentPresencesByYear, justifyAbsence, getStudentsAbsenceAndPresence} = require('../controllers/studentPresence.controller')


//------GET---------//
Router.route("/getStudentsPresenceAndAbsence/:sessionId").get(getStudentsAbsenceAndPresence)



//------POST---------//
Router.route("/saveStudentPresence").post(saveStudentPresence)
Router.route("/saveStudentAbsence").post(saveStudentAbsence)

module.exports = Router
