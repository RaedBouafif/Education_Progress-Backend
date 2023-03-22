const { create, deleteById, getById, getAll, update, getAllGroups, addStudent, deleteStudent, countDocsss} = require("../controllers/group.controller")
const Router = require("express").Router()


//---POST---//
Router.route("/create").post(create)
//---GET---//
Router.route("/getAll").get(getAll)
Router.route("/getAllGroups/:collegeYearId").get(getAllGroups)//get without distinct
Router.route("/getById/:groupId").get(getById)
Router.route("/addStudent/:groupId/:studentId").get(addStudent)
Router.route("/count").get(countDocsss)
//---DELETE---//
Router.route("/deleteById/:groupId").delete(deleteById)
Router.route("/deleteStudent/:groupId/:studentId").delete(deleteStudent)
//---UPDATE---//
Router.route("/update/:groupId").put(update)

module.exports = Router