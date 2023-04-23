const { createSession, findSessions, startManually, findSessionById, createManualSession, createTemplateSession,
    settingStartedDate,
    getSessionDetails,
    settingEndedDate

} = require('../controllers/session.controller')
const Router = require('express').Router()

//post
// Router.route("/createManualSession").post(createManualSession)
// Router.route("/createTemplateSession").post(createTemplateSession)
//get
// Router.route("/getSessions").get(findSessions)
// Router.route("/getById/:sessionId").get(findSessionById)
Router.route("/startingSession/:sessionId/:startedAt").get(settingStartedDate)
Router.route("/endingSesiion/:sessionId/:endedAt").get(settingEndedDate)
Router.route("/getSessionDetails").get(getSessionDetails)
Router.route("/startManually/:sessionId/:startsAt/:endsAt").get(startManually)
module.exports = Router