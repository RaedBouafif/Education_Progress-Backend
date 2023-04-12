const { createSession, findSessions, findSessionById, createManualSession, createTemplateSession,
    startingSession,
    getSessionDetails

} = require('../controllers/session.controller')
const Router = require('express').Router()

//post
// Router.route("/createManualSession").post(createManualSession)
// Router.route("/createTemplateSession").post(createTemplateSession)
//get
// Router.route("/getSessions").get(findSessions)
// Router.route("/getById/:sessionId").get(findSessionById)
Router.route("/startingSession/:sessionId/:startedAt").get(startingSession)
Router.route("/getSessionDetails").get(getSessionDetails)
module.exports = Router