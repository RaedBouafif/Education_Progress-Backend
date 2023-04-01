const {
    create,
    addSessionToTemplate,
    getTemplatesByGroupAndCollegeYear,
    getTemplatesByGroup,
    deleteSessionFromTemplate,
    updateSessionFromTemplate,
    getAvailableGroups
} = require('../controllers/template.controller')
const Router = require('express').Router()

Router.route("/create").post(create)
Router.route("/addSession").post(addSessionToTemplate)
Router.route("/updateSession").post(updateSessionFromTemplate)
Router.route("/deleteSession/:templateId/:sessionId").delete(deleteSessionFromTemplate)
Router.route("/getAll").get(getTemplatesByGroupAndCollegeYear)
Router.route("/getAllByGroup").post(getTemplatesByGroup)
Router.route("/availableGroups/:collegeYear/:section/:day/:startsAt/:duration").get(getAvailableGroups)

module.exports = Router

