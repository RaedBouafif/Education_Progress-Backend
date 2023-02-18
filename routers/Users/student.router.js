const { createStudent, login, updateStudent, deleteStudent, findOneStudent, findAllStudents, findOneStudentWithParent, findAllStudentsWithParent} = require("../../controllers/Users/student.controller")
const Router = require('express').Router()

//get
Router.route("/getById/:studentId").get(findOneStudent)
Router.route("/getByIdWithParent/:studentId").get(findOneStudentWithParent)
Router.route("/getAll").get(findAllStudents)
Router.route("/getAllWithParent").get(findAllStudentsWithParent)
//post
Router.route("/create").post(createStudent)
Router.route("/login").post(login)
//put
Router.route("/update/:studentId").put(updateStudent)
//delete
Router.route("/delete/:studentId").delete(deleteStudent)



module.exports = Router