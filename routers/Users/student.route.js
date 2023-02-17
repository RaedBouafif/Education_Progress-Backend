const { createStudent, login, updateStudent, deleteStudent, findOneStudent, findAllStudents} = require("../../controllers/Users/student.controller")
const Router = require('express').Router()

Router.route("/create").post(createStudent)
Router.route("/login").post(login)
Router.route("/update").put(updateStudent)
Router.route("/delete/:studentId").delete(deleteStudent)
Router.route("/getStudent/:studentId").get(findOneStudent)
Router.route("/getAllStudents").get(findAllStudents)


module.exports = { studentRouter : Router}