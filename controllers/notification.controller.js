const Notification = require("../models/notification.model")
const Student = require("../models/Users/student.model")
const Teacher = require("../models/Users/teacher.model")
const Parent = require("../models/Users/parent.model")
const Admin = require("../models/Users/admin.model")
const StudentAbsence = require("../models/studentAbsence.model")
const TeacherAbsence = require("../models/teacherAbsence.model")
const Reports = require("../models/reports.model")
const Session = require("../models/session.model")




const { Types, Schema } = require("mongoose")


// get notifications
exports.getNotifications = async (req,res) => {
    const actorId = req.params.id 
    try{
        if (!actorId){
            return res.status(400).send({
                error : "BadRequest"
            })
        }
        const notifications = await Notification.find({ receivers : {$elemMatch : { receiverId : new Types.ObjectId(actorId)}}, seen : false}).sort( {createdAt : -1 })
        if (!notifications){
            return res.status(204).send({
                available : false
            })
        }else{
            return res.status(200).send(notifications)
        }
    }catch(e){
        console.log(e)
        return res.status(500).send({
            error : "Server Error"
        })
    }
}



//get notifications with details
exports.getNotificationsWithDetails = async(req,res) => {
    const actorId = req.params.id
    try{
        if (!actorId){
            return res.status(400).send({
                error : "BadRequest"
            })
        }
        // sender need test on populate
        const notifications = await Notification.find({ receivers : {$elemMatch : { receiverId : new Types.ObjectId(actorId)}}}).sort( {createdAt : -1 })
            .populate(
                'sender.senderId'
            )
            .populate("studentAbsence")
            .populate("teacherAbsence")
            .populate("report")
            .populate("session")

        console.log(notifications)
        return (notifications) ? res.status(200).send(notifications) :  res.status(204).send({ message : "There is no Notifications"})
    }catch(e){
        console.log(e)
            return res.status(500).send({
                error :"Server Error"
            })
    }
}

exports.seenNotification = async(req,res) => {
    try{
        const notifId = req.params.id
        console.log(notifId)
        if (!notifId){
            return res.status(400).send({
                error : "BadRequest"
            })
        }
        const notification = await Notification.findByIdAndUpdate(new Types.ObjectId(notifId), { seen : true }, { runValidators : true , new : true})
            .populate(
                'sender.senderId'
            )
            .populate("studentAbsence")
            .populate("teacherAbsence")
            .populate("report")
            .populate("session")
        console.log(notification)
        return (notification) ? res.status(200).send(notification) :  res.status(204).send({ message : "There is no Notifications id: "+notifId})
    }catch(e){
        console.log(e)
            return res.status(500).send({
                error :"Server Error"
            })
    }
}
