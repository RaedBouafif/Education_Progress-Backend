const Router = require("express").Router()
const authMiddleWare = require("../middlewares/auth")
const { createExam, findAvailableTeachersForExams } = require("../controllers/examen.controller")

Router.route("/createExamen").post( createExam)
Router.route("/findAvailableTeachers/:startsAt/:duree/:day/:collegeYear/:week").post(authMiddleWare(["admin", "super", "owner"]), findAvailableTeachersForExams)
module.exports = Router
