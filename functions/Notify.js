
const NotificationModel = require("../models/notification.model")

const notify = async (notificationData) => {
    try {
        const notification = await NotificationModel.create(notificationData)
        await notification.save()
    } catch (e) {
        console.log(e)
    }
}


module.exports = { notify }