const Router = require("express").Router()
const authMiddleWare = require("../middlewares/auth")
const { createExam, findAvailableTeachersForExams, updateSessionExam, getExam } = require("../controllers/examen.controller")

Router.route("/getExam").post(authMiddleWare(["admin", "super", "owner"]), getExam)
Router.route("/findAvailableTeachers/:startsAt/:duree/:day/:collegeYear/:week").get(authMiddleWare(["admin", "super", "owner"]), findAvailableTeachersForExams)
Router.route("/updateSessionExam/:idSession/:teacher/:classroom/:startsAt/:endsAt/:dateDebPlanning/:examenType/:examenNumber").put(updateSessionExam)
module.exports = Router
