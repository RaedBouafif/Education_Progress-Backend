const { create, deleteById, getById, getAll, update } = require("../controllers/group.controller")
const Router = require("express").Router()


//---POST---//
Router.route("/create").post(create)
//---GET---//
Router.route("/getAll/:yearId").get(getAll)
Router.route("/getById/:groupId").get(getById)
//---DELETE---//
Router.route("/deleteById/:groupId").delete(deleteById)
//---UPDATE---//
Router.route("/update/:groupId").put(update)

module.exports = Router