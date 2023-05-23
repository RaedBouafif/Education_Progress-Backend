const { create, getAll, deleteById, getById, update, countDocsss, findAvailableClassroms } = require("../controllers/classroom.controller")
const authMiddleWare = require("../middlewares/auth")
const Router = require("express").Router()



//---POST---//
Router.route("/create").post(authMiddleWare(["owner", "admin", "super"]), create)
Router.route("/getAvailableClassrooms").post(authMiddleWare(["owner", "admin", "teacher", "super"]), findAvailableClassroms)
//---GET---//
Router.route("/getAll").get(authMiddleWare(["owner", "admin", "teacher", "super"]), getAll)
Router.route("/getById/:classroomId").get(authMiddleWare(["owner", "admin", "teacher", "super"]), getById)
Router.route("/count").get(authMiddleWare(["owner", "admin", "teacher", "super"]), countDocsss)
//---DELETE---//
Router.route("/delete/:classroomId").delete(authMiddleWare(["owner", "admin", "super"]), deleteById)
//---UPDATE---//
Router.route("/update/:classroomId").put(authMiddleWare(["owner", "admin", "super"]), update)

module.exports = Router