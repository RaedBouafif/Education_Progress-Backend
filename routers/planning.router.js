const { create, getAll, getById, deleteById, update } = require("../controllers/planning.controller")

const Router = require("express").Router()


//---POST---//
Router.route("/create").post(create)
//---GET---//
Router.route("/getAll").get(getAll)
Router.route("/getById/:planningId").get(getById)
//---DELETE---//
Router.route("/deleteById/:planningId").delete(deleteById)
//---UPDATE---// 
Router.route("/update/:planningId").put(update)

module.exports = Router