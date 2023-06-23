
const NotificationModel = require("../models/notification.model")

const notify = async (notificationData) => {
    try {
        const notification = await NotificationModel.create(notificationData)
        await notification.save()
        console.log(notification)
    } catch (e) {
        console.log(e)
    }
}


module.exports = { notify }