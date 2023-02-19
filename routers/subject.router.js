const { createSubject, findAllSubjects, findSubjectByName, updateSubject, deleteSubject, changeSubjectState} = require('../controllers/subject.controller')
const Router = require('express').Router()

//get
Router.route("/getAll").get(findAllSubjects)
Router.route("/getByName/:subjectName").get(findSubjectByName)

//post
Router.route("/create").post(createSubject)

//delete
Router.route("/delete/:subjectName").delete(deleteSubject)
//put
Router.route("/update/:subjectName").put(updateSubject)
Router.route("/changeState").put(changeSubjectState)

module.exports = Router 