const {
    create,
    addSessionToTemplate,
    getTemplatesByGroupAndCollegeYear,
    getTemplatesByGroup,
    deleteSessionFromTemplate,
    updateSessionFromTemplate
} = require('../controllers/template.controller')
const Router = require('express').Router()

Router.route("/create").post(create)
Router.route("/addSession").post(addSessionToTemplate)
Router.route("/updateSession").post(updateSessionFromTemplate)
Router.route("/deleteSession/:templateId/:sessionId").delete(deleteSessionFromTemplate)
Router.route("/getAll").get(getTemplatesByGroupAndCollegeYear)
Router.route("/getAllByGroup").post(getTemplatesByGroup)

module.exports = Router

