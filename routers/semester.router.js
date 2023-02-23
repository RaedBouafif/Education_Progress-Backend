const { create, update, getAll } = require("../controllers/semester.controller")
const Router = require("express").Router()




//---POST---//
Router.route("/create").post(create)
//---GET---//
Router.route("/getAll").get(getAll)
//---PUT---//
Router.route("/update/:semesterId").put(update)



module.exports = Router