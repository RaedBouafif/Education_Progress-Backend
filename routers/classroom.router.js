const { create, getAll, deleteById, getById, update } = require("../controllers/classroom.controller")
const Router = require("express").Router()



//---POST---//
Router.route("/create").post(create)
//---GET---//
Router.route("/getAll").get(getAll)
Router.route("/getById/:classroomId").get(getById)
//---DELETE---//
Router.route("/delete/:classroomId").delete(deleteById)
//---UPDATE---//
Router.route("/update/:classroomId").put(update)

module.exports = Router