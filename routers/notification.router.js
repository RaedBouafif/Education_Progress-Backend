const Router = require("express").Router()

const { getNotifications, getNotificationsWithDetails, seenNotification } = require("../controllers/notification.controller")

Router.route("/getMyNotifications/:id").get(getNotifications)
Router.route("/getNotificationsWithDetails/:id").get(getNotificationsWithDetails)
Router.route("/seenNotification/:id").get(seenNotification)

module.exports = Router