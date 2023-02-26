const { createSession, findSessions, findSessionById, createManualSession, createTemplateSession } = require('../controllers/session.controller')
const Router = require('express').Router()

//post
Router.route("/createManualSession").post(createManualSession)
Router.route("/createTemplateSession").post(createTemplateSession)
//get
Router.route("/getSessions").get(findSessions)
Router.route("/getById/:sessionId").get(findSessionById)
module.exports = Router