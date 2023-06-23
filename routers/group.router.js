const { create, deleteById, getById, getAll, update, getAllGroups, addStudent, deleteStudent, countDocsss, findAllAvailableSubjects, getNumberStudentsPerYear } = require("../controllers/group.controller")
const Router = require("express").Router()
const authMiddleWare = require("../middlewares/auth")

//---POST---//
Router.route("/create").post(authMiddleWare(["admin", "super", "owner"]), create)
//---GET---//
Router.route("/getAll").get(authMiddleWare(["owner", "admin", "teacher", "super"]), getAll)
Router.route("/getAllGroups/:collegeYearId").get(authMiddleWare(["owner", "admin", "teacher", "super"]), getAllGroups)//get without distinct
Router.route("/getById/:groupId").get(authMiddleWare(["owner", "admin", "teacher", "super"]), getById)
Router.route("/addStudent/:groupId/:studentId").get(authMiddleWare(["admin", "super", "owner"]), addStudent)
Router.route("/count").get(countDocsss)
Router.route("/getAvailableSubjects/:groupId").get(authMiddleWare(["owner", "admin", "teacher", "super"]), findAllAvailableSubjects)
// Router.route("/getNumberStudentsPerYear").get(authMiddleWare(["owner", "admin", "super"]), getNumberStudentsPerYear)
//---DELETE---//
Router.route("/deleteById/:groupId").delete(authMiddleWare(["admin", "super", "owner"]), deleteById)
Router.route("/deleteStudent/:groupId/:studentId").delete(authMiddleWare(["admin", "super", "owner"]), deleteStudent)
//---UPDATE---//
Router.route("/update/:groupId").put(authMiddleWare(["admin", "super", "owner"]), update)

module.exports = Router