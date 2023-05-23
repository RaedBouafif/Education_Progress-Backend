const { create, update, getAll } = require("../controllers/semester.controller")
const Router = require("express").Router()
const authMiddleWare = require("../middlewares/auth")



//---POST---//
Router.route("/create").post(authMiddleWare(["super", "owner", "admin"]), create)
//---GET---//
Router.route("/getAll").get(authMiddleWare(["super", "owner", "admin", "teacher"]), getAll)
//---PUT---//
Router.route("/update/:semesterId").put(authMiddleWare(["super", "owner", "admin"]), update)




module.exports = Router