const Router = require("express").Router()
const authMiddleWare = require("../middlewares/auth")
const { createExam, findAvailableTeachersForExams, updateSessionExam } = require("../controllers/examen.controller")

Router.route("/createExamen").post(authMiddleWare(["admin", "super", "owner"]), createExam)
Router.route("/findAvailableTeachers/:startsAt/:duree/:day/:collegeYear/:week").post(authMiddleWare(["admin", "super", "owner"]), findAvailableTeachersForExams)
Router.route("/updateSessionExam/:idSession/:teacher/:classroom/:startsAt/:endsAt/:dateDebPlanning/:examenType/:examenNumber").put(updateSessionExam)
module.exports = Router
