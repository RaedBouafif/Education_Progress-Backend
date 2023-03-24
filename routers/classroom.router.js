const { create, getAll, deleteById, getById, update,  countDocsss, findAvailableClassroms } = require("../controllers/classroom.controller")
const Router = require("express").Router()



//---POST---//
Router.route("/create").post(create)
Router.route("/getAvailableClassrooms").post(findAvailableClassroms)
//---GET---//
Router.route("/getAll").get(getAll)
Router.route("/getById/:classroomId").get(getById)
Router.route("/count").get(countDocsss)
//---DELETE---//
Router.route("/delete/:classroomId").delete(deleteById)
//---UPDATE---//
Router.route("/update/:classroomId").put(update)

module.exports = Router