const { createCollegeYear } = require("../controllers/collegeYear.controller")
const Router = require("express").Router()


Router.route("/create").get(createCollegeYear)

module.exports = Router