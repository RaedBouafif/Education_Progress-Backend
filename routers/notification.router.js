const Router = require("express").Router()

const { getNotifications, getNotificationsWithDetails, seenNotification } = require("../controllers/notification.controller")
const authMiddleWare = require("../middlewares/auth")
Router.route("/getMyNotifications/:id").get(authMiddleWare(), getNotifications)
Router.route("/getNotificationsWithDetails/:id").get(authMiddleWare(), getNotificationsWithDetails)
Router.route("/seenNotification/:id").get(authMiddleWare(), seenNotification)

module.exports = Router