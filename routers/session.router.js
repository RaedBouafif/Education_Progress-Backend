const { createSession, findSessions, findSessionById } = require('../controllers/session.controller')
const Router = require('express').Router()

//post
Router.route("/create").post(createSession)
//get
Router.route("/getSessions").get(findSessions)
Router.route("/getById/:sessionId").get(findSessionById)

module.exports = Router