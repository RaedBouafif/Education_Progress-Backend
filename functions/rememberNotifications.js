const cron = require("node-cron")
const Notification = require("../models/notification.model")



exports.rememberNotifications = async (req,res) => {
    try{
        const notificaitons = await Notification.find({ declarationAbsence: { $exists: true, $ne: null}, active: true, canceled: false })
        if (notificaitons){
            return res.status(200).send(notificaitons)
        }else{
            return res.status(204).send({
                message: "Empty database from notifications"
            })
        }
    }catch(e){
        console.log(e)
        return res.status(500).send({
            error : "Server Error"
        })
    }
}

cron.schedule('0 0 * * *', () => {
    console.log("Running the function at midnight")
})
