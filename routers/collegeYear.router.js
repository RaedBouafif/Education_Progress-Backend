const { createCollegeYear } = require("../controllers/collegeYear.controller")
const Router = require("express").Router()


Router.route("/create").post(createCollegeYear)

module.exports = Router