const { createSession, findSessions } = require('../controllers/session.controller')
const Router = require('express').Router()

//post
Router.route("/create").post(createSession)
Router.route("/getSessions").get(findSessions)

module.exports = Router