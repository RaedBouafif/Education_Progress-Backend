const { createSubject, findAllSubjects, findAllSubjectsWithTeachers, findSubjectByName, updateSubject, deleteSubject, changeSubjectState, findAvailableTeachers } = require('../controllers/subject.controller')
const Router = require('express').Router()
const authMiddleWare = require("../middlewares/auth")
//get
Router.route("/getAll").get(authMiddleWare(["super", "admin", "teacher", "owner"]), findAllSubjects)
Router.route("/getAllDoc").get(authMiddleWare(["super", "admin", "teacher", "owner"]), findAllSubjectsWithTeachers)
Router.route("/getByName/:subjectName").get(authMiddleWare(["super", "admin", "teacher", "owner"]), findSubjectByName)

//post
Router.route("/create").post(authMiddleWare(["super", "admin", "owner"]), createSubject)
Router.route("/getAvailableTeachers/:subjectId").post(authMiddleWare(["super", "admin", "owner", "teacher"]), findAvailableTeachers)

//delete
Router.route("/delete/:subjectId").delete(authMiddleWare(["super", "admin", "owner"]), deleteSubject)
//put
Router.route("/update/:subjectId").put(authMiddleWare(["super", "admin", "owner"]), updateSubject)
Router.route("/changeState").put(authMiddleWare(["super", "admin", "owner"]), changeSubjectState)

module.exports = Router 