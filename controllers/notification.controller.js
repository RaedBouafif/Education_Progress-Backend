const Notification = require("../models/notification.model")
const Student = require("../models/Users/student.model")
const Teacher = require("../models/Users/teacher.model")
const Parent = require("../models/Users/parent.model")
const Admin = require("../models/Users/admin.model")
const StudentAbsence = require("../models/studentAbsence.model")
const TeacherAbsence = require("../models/teacherAbsence.model")
const Reports = require("../models/reports.model")
const Session = require("../models/session.model")
const Planning = require("../models/Planning.model")
const DeclarationAbsence = require("../models/declarationAbsence.model")




const { Types, Schema } = require("mongoose")


// get notifications
exports.getNotifications = async (req, res) => {
    const actorId = req.params.id
    try {
        if (!actorId) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        const notifications = await Notification.find({ receivers: { $elemMatch: { receiverId: new Types.ObjectId(actorId) } }, seen: false, canceled: false }).sort({ createdAt: -1 })
        if (!notifications) {
            return res.status(204).send({
                available: false
            })
        } else {
            return res.status(200).send(notifications)
        }
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}



//get notifications with details
exports.getNotificationsWithDetails = async (req, res) => {
    const actorId = req.params.id
    try {
        if (!actorId) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        // sender need test on populate
        const notifications = await Notification.find({ receivers: { $elemMatch: { receiverId: new Types.ObjectId(actorId) } }, canceled: false }).sort({ createdAt: -1 })
            .populate(
                'sender.senderId'
            )
            .populate("studentAbsence")
            .populate("teacherAbsence")
            .populate("report")
            .populate("session")

        console.log(notifications)
        return (notifications) ? res.status(200).send(notifications) : res.status(204).send({ message: "There is no Notifications" })
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}

exports.seenNotification = async (req, res) => {
    try {
        const {idNotification, idUser} = req.params
        console.log(idNotification)
        if (!idNotification) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        const notification = await Notification.findByIdAndUpdate(new Types.ObjectId(idNotification), { $push: { seen : idUser } }, { runValidators: true, new: true })
            .populate(
                'sender.senderId'
            )
            .populate("studentAbsence")
            .populate("teacherAbsence")
            .populate("report")
            .populate("session")
        console.log(notification)
        return (notification) ? res.status(200).send(notification) : res.status(204).send({ message: "There is no Notifications id: " + idNotification })
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}

exports.changeNotificationState = async (async, res) => {
    try {
        const { notificationId } = req.params
        if (!notificationId) {
            return res.status(400).send({
                error: "Server error"
            })
        }
        const notification = await Notification.findById(Types.ObjectId(notificationId))
        if (!notification) {
            return res.status(404).send({
                eroor: "Not Found",
                message: "Notification with id: " + notificationId + " does not exist!"
            })
        }
        notification.active = !notification.active
        await notification.save()
        return res.status(200).send({
            changed: true,
            notification
        })
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}

exports.validateNotification = async (req, res) => {
    const { idNotification } = req.params
    try {
        const notification = await Notification.findByIdAndUpdate(idNotification, { active: true })
        return notification ? res.status(200).send({ activated: true, notification }) : res.status(404).send({ message: "NotFound" })
    } catch (e) {
        return res.status(500).send({
            error: "Server Error"
        })
    }
}


// exports.getNotificationsDeclaration = async(req,res) => {
//     try{
//         const notifications = await Notification.find({declarationAbsence : { $exists: true}})
//         return notifications ? res.status(200).send(notifications) : res.status(404).send({ message : "There is no notifications of declarationAbsence in database"})
//     }catch(e)
//     {
//         console.log(e.message)
//         return res.status(500).send({
//             error: "Server Error"
//         }) 
//     }
// }


function addDays(dateString, numDays) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + numDays);
    return date.toISOString();
}

function addMinutes(dateString, numMinutes) {
    const date = new Date(dateString);
    date.setTime(date.getTime() + numMinutes * 60000);
    return date.toISOString();
}

function resetTimeToMidnight(dateString) {
    const date = new Date(dateString);
    date.setUTCHours(0, 0, 0, 0);
    return date.toISOString();
}

exports.getNotificationDeclaredWithDetails = async (req, res) => {
    try {
        const { idNotification } = req.params
        console.log(idNotification)
        const notification = await Notification.findById(idNotification).populate({ path: "declarationAbsence", populate: { path: "teacher" } })
        if (notification) {
            var dateDebDeclaration = new Date(notification.declarationAbsence.dateDeb)
            var dateFinDeclaration = new Date(notification.declarationAbsence.dateFin)
            var teacher = notification.declarationAbsence.teacher
            const plannings = await Planning.find(
                {
                    $or: [
                        { dateBegin: { $lte: dateDebDeclaration }, dateEnd: { $gte: dateDebDeclaration } },
                        { dateBegin: { $lte: dateFinDeclaration }, dateEnd: { $gte: dateFinDeclaration } },
                        { dateBegin: { $gte: dateDebDeclaration }, dateEnd: { $lte: dateFinDeclaration } }
                    ]
                })
                .populate({ path: "sessions", match: { teacher: Types.ObjectId(teacher._id)}, populate: [{ path: "group", populate: { path: "section" } }, { path: "classroom" }, { path: "subject" }] })
            var consernedSessions = []
            for (let i = 0; i < plannings.length; i++) {
                let planning_starting = plannings[i].dateBegin
                // const sessions = plannings[i].sessions?.filter((element) => Array.isArray(element) && element.length).length ? plannings[i].sessions.filter((element) => Array.isArray(element.sessions)) : []
                const sessions = plannings[i].sessions
                for (let j = 0; j < sessions.length; j++) {
                    if (sessions[j]) {
                        var currentSession = sessions[j]
                        var realDay = currentSession.day === 0 ? 7 : currentSession.day
                        var session_startsAt_v1 = addDays(planning_starting, Number(realDay - 1))
                        var session_startsAt_resetedTomidNight = resetTimeToMidnight(session_startsAt_v1)
                        var session_endsAt = session_startsAt_resetedTomidNight
                        var session_startsAt_v2 = addMinutes(session_startsAt_resetedTomidNight, Number(currentSession.startsAt))
                        var session_endsAt_v2 = addMinutes(session_endsAt, Number(currentSession.endsAt))
                        if (dateDebDeclaration <= new Date(session_startsAt_v2) && dateFinDeclaration >= new Date(session_endsAt_v2)) {
                            var startingDate = new Date(session_startsAt_v2)
                            var endingDate = new Date(session_endsAt_v2)
                            consernedSessions.push({ ...currentSession._doc, startingDate, endingDate, weekSession: plannings[i].week, collegeYear: plannings[i].collegeYear })
                        }
                    }
                }
            }
            const finalData = {
                sessions: consernedSessions,
                declarationAbsence: notification.declarationAbsence,
                activeDeclaration: notification.active
            }
            return res.status(200).send(finalData)
        } else {
            return res.status(404).send({
                message: "Session with id: " + idNotification + " Not found"
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}

exports.cancelNotification = async (req, res) => {
    try {
        const { idNotification } = req.params
        const notification = await Notification.findByIdAndUpdate(Types.ObjectId(idNotification), { canceled : true}, {new : true})
        if (notification) {
            return res.status(200).send({
                canceled: true,
                notification
            })
        } else {
            return res.status(404).send({
                message: "Session with id: " + idNotification + " Not found"
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}