const {
    create,
    addSessionToTemplate,
    getTemplatesByGroupAndCollegeYear,
    getTemplatesByGroup    
} = require('../controllers/template.controller')
const Router = require('express').Router()

Router.route("/create").post(create)
Router.route("/addSession").post(addSessionToTemplate)
Router.route("/getAll").post(getTemplatesByGroupAndCollegeYear)
Router.route("/getAllByGroup").post(getTemplatesByGroup)

module.exports = Router 

