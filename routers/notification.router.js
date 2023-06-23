const Router = require("express").Router()

const { getNotifications, getNotificationsWithDetails, seenNotification, validateNotification, getNotificationsDeclaration } = require("../controllers/notification.controller")
const authMiddleWare = require("../middlewares/auth")
Router.route("/getMyNotifications/:id").get(authMiddleWare(), getNotifications)
Router.route("/getNotificationsWithDetails/:id").get(authMiddleWare(), getNotificationsWithDetails)
Router.route("/seenNotification/:id").get(authMiddleWare(), seenNotification)
Router.route("/validateNotification/:daclarationAbsenceId").get(validateNotification)
Router.route("/getNotificationsDeclaration").get(getNotificationsDeclaration)

module.exports = Router