const Router = require("express").Router()

const { getNotifications, getNotificationsWithDetails, seenNotification, validateNotification, getNotificationsDeclaration, getNotificationDeclaredWithDetails, cancelNotification } = require("../controllers/notification.controller")
const { rememberNotifications } = require("../functions/rememberNotifications")
const authMiddleWare = require("../middlewares/auth")
Router.route("/getMyNotifications/:id").get(authMiddleWare(), getNotifications)
Router.route("/getNotificationsWithDetails/:id").get(authMiddleWare(), getNotificationsWithDetails)
Router.route("/seenNotification/:idNotification/:idUser").get(authMiddleWare(), seenNotification)
Router.route("/validateNotification/:idNotification").get(validateNotification)
// Router.route("/getNotificationsDeclaration/:idNotification").get(getNotificationsDeclaration)
Router.route("/getNotificationDeclaration/:idNotification").get(getNotificationDeclaredWithDetails)
Router.route("/cancelNotification/:idNotification").get(cancelNotification)
Router.route("/rememberNotifications").get(rememberNotifications)
module.exports = Router