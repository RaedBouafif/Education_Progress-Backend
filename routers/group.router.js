const { create, deleteById, getById, getAll, update, getAllGroups } = require("../controllers/group.controller")
const Router = require("express").Router()


//---POST---//
Router.route("/create").post(create)
//---GET---//
Router.route("/getAll").get(getAll)
Router.route("/getAllGroups").get(getAllGroups)//get without distinct
Router.route("/getById/:groupId").get(getById)
//---DELETE---//
Router.route("/deleteById/:groupId").delete(deleteById)
//---UPDATE---//
Router.route("/update/:groupId").put(update)

module.exports = Router