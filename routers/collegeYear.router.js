const { createCollegeYear, findAllCollegeYears, createCollegeYearWithSemesters, updateCollegeYear, findAllToPlot } = require("../controllers/collegeYear.controller")
const Router = require("express").Router()
const authMiddleWare = require("../middlewares/auth")

Router.route("/create").post(authMiddleWare(["admin", "super", "owner"]), createCollegeYear)
Router.route("/createWsemesters").post(authMiddleWare(["admin", "super", "owner"]), createCollegeYearWithSemesters)
Router.route("/getAll").get(authMiddleWare(["owner", "admin", "teacher", "super"]), findAllCollegeYears)
Router.route("/getAllToPlot").get(authMiddleWare(["owner", "admin", "super"]), findAllToPlot)
Router.route("/updateCollegeYear").post(authMiddleWare(["admin", "super", "owner"]), updateCollegeYear)
// Router.route("/delete/:yearId").delete(authMiddleWare(["admin", "super", "owner"]), deleteCollegeYear)

module.exports = Router