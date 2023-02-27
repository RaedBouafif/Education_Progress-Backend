const Router = require('express').Router()
const { saveAbsence, getAllTeachersAbsences, getTeacherAbsences, justifyAbsence, getTeacherAbsencesByYear} = require('../controllers/teacherAbsence.controller')


//------GET---------//
Router.route("/getAllAbsencesByYear/:year").get(getAllTeachersAbsences)
Router.route("/getTeacherAbsences/:teacherid").get(getTeacherAbsences)
Router.route("/justify/:absenceId").get(justifyAbsence)
Router.route("/getTeacherAbsencesByYear/:teacherid").get(getTeacherAbsencesByYear)


//------POST---------//
Router.route("/saveAbsence").post(saveAbsence)


module.exports = Router
