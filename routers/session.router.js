const { createSession, findSessions, startManually, findSessionById, createManualSession, createTemplateSession,
    settingStartedDate,
    getSessionDetails,
    settingEndedDate,
    getAllSessions,
    deleteSuspendedSessions

} = require('../controllers/session.controller')
const Router = require('express').Router()
const authMiddleWare = require("../middlewares/auth")
//post
// Router.route("/createManualSession").post(createManualSession)
// Router.route("/createTemplateSession").post(createTemplateSession)
//get
// Router.route("/getSessions").get(findSessions)
// Router.route("/getById/:sessionId").get(findSessionById)
Router.route("/startingSession/:sessionId/:startedAt").get(authMiddleWare(["admin", "teacher", "owner", "super"]), settingStartedDate)
Router.route("/endingSesiion/:sessionId/:endedAt").get(authMiddleWare(["admin", "teacher", "owner", "super"]), settingEndedDate)
Router.route("/getSessionDetails").get(authMiddleWare(["admin", "teacher", "owner", "super"]), getSessionDetails)
Router.route("/startManually/:sessionId/:startsAt/:endsAt").get(authMiddleWare(["admin", "teacher", "owner", "super"]), startManually)
// extra for test
Router.route("/delete").delete(deleteSuspendedSessions)
Router.route("/getAllSessions").get(getAllSessions)

module.exports = Router