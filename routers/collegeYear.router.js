const { createCollegeYear, findAllCollegeYears, createCollegeYearWithSemesters, updateCollegeYear, deleteCollegeYear} = require("../controllers/collegeYear.controller")
const Router = require("express").Router()


Router.route("/create").post(createCollegeYear)
Router.route("/createWsemesters").post(createCollegeYearWithSemesters)
Router.route("/getAll").get(findAllCollegeYears)
Router.route("/updateCollegeYear").post(updateCollegeYear)
Router.route("/delete/:yearId").delete(deleteCollegeYear)

module.exports = Router