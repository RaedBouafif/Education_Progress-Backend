const { Types, default: mongoose } = require("mongoose")
const Teacher = require("../models/Users/teacher.model")
const Student = require("../models/Users/student.model")
const DeclarationAbsence = require("../models/declarationAbsence.model")
const Session = require("../models/session.model")
const Group = require("../models/group.model")
const Planning = require("../models/Planning.model")
const Admin = require("../models/Users/admin.model")
const multer = require("multer")
const { notify } = require("../functions/Notify")
const jwt = require("jsonwebtoken")
const { ObjectId } = require("mongodb")
const { cpSync } = require("fs")
require("dotenv").config()



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

exports.createDeclaration = async (req, res) => {
    console.log(req.body)
    try {
        const { dateDeb, dateFin, description, studentId, teacherId, active, senderId, senderPath } = req.body
        if ((!dateDeb) || (!dateFin)) {
            return res.status(400).send({
                error: "Bad Request"
            })
        }
        var notificationData = {
            active: active,
            notificationType: "teacherAbsenceDeclared"
        }
        var finalDateDeb = new Date(dateDeb)
        var finalDateFin = new Date(dateFin)
        const declarationAbsence = await DeclarationAbsence.create({
            student: studentId ? Types.ObjectId(studentId) : null,
            teacher: teacherId ? Types.ObjectId(teacherId) : null,
            dateDeb: finalDateDeb,
            dateFin: finalDateFin,
            description: description,
            file: { name: req.file?.originalname, path: req.file?.path } || null
        })
        await declarationAbsence.save()
        if (!declarationAbsence) {
            return res.status(400).send({
                message: "Some error occured while creating the absence"
            })
        }
        if (teacherId) {
            //retreiving teacher for more data
            const teacher = await Teacher.findById(Types.ObjectId(teacherId))
            const admins = await Admin.find()
            //finding the concerned sessions
            const plannings = await Planning.find(
                {
                    $or: [
                        { dateBegin: { $lte: finalDateDeb }, dateEnd: { $gte: finalDateDeb } },
                        { dateBegin: { $lte: finalDateFin }, dateEnd: { $gte: finalDateFin } },
                        { dateBegin: { $gte: finalDateDeb }, dateEnd: { $lte: finalDateFin } }
                    ]
                })
                .populate({ path: "sessions", match: { teacher: Types.ObjectId(teacherId) }, populate: { path: "group", populate: { path: "students", select: { password: 0 } } } })
            var consernedSessions = []
            for (let i = 0; i < plannings.length; i++) {
                let planning_starting = plannings[i].dateBegin
                const sessions = plannings[i].sessions
                for (let j = 0; j < sessions.length; j++) {
                    if (sessions[j]) {
                        var currentSession = sessions[j]
                        var realDay = currentSession.day === 0 ? 7 : currentSession.day
                        //setting the session starts date and ends date
                        var session_startsAt_v1 = addDays(planning_starting, Number(realDay - 1))
                        var session_startsAt_resetedTomidNight = resetTimeToMidnight(session_startsAt_v1)
                        var session_endsAt = session_startsAt_resetedTomidNight
                        var session_startsAt_v2 = addMinutes(session_startsAt_resetedTomidNight, Number(currentSession.startsAt))
                        var session_endsAt_v2 = addMinutes(session_endsAt, Number(currentSession.endsAt))
                        if (finalDateDeb <= new Date(session_startsAt_v2) && finalDateFin >= new Date(session_endsAt_v2)) {
                            consernedSessions.push(currentSession)
                            currentSession.suspended = true
                            await currentSession.save()
                        }
                    }
                }
            }
            console.log("------------------------------------------------------")
            console.log(consernedSessions)
            try {
                var preparingReceivers = [
                    { receiverId: teacher._id, receiverPath: "Teacher" },
                ]
                for (let k = 0; k < consernedSessions.length; k++) {
                    var cSession = consernedSessions[k]
                    if (cSession.group && cSession.group.students?.length != 0) {
                        for (let x = 0; x < cSession.group.students.length; x++) {
                            preparingReceivers.push({ receiverId: Types.ObjectId(cSession.group.students[k]._id), receiverPath: "Student" })
                            preparingReceivers.push({ receiverId: Types.ObjectId(cSession.group.students[k].parent._id), receiverPath: "Parent" })
                        }
                        for (let h = 0; h < admins.length; h++) {
                            preparingReceivers.push({ receiverId: Types.ObjectId(admins[h]._id), receiverPath: "Admin" })
                        }
                    }

                }
                notificationData = {
                    ...notificationData,
                    active: active,
                    object: "Absence d'enseignant: " + teacher.firstName.toUpperCase() + " " + teacher.lastName.toUpperCase(),
                    content: `L'enseignant ${teacher.firstName} ${teacher.lastName} sera absent à partir de le date: ${dateDeb} jusqu'a le date: ${dateFin}`,
                    sender: { senderPath: senderPath, senderId: Types.ObjectId(senderId) },
                    receivers: preparingReceivers,
                    declarationAbsence: declarationAbsence._id
                }
                notify(notificationData)
            } catch (e) {
                console.log(e)
            }
        } else {
            const student = await Student.findById(Types.ObjectId(studentId), { select: { password: 0 } })
            try {
                notificationData = {
                    ...notificationData,
                    active: true,
                    object: "Absence d'élève: " + student.firstName.toUpperCase() + " " + student.lastName.toUpperCase(),
                    content: `L'enseignant ${student.firstName} ${student.lastName} sera absent à partir de le date: ${dateDeb} jusqu'a le date: ${dateFin}`,
                    sender: { senderPath: senderPath, senderId: Types.ObjectId(senderId) },
                    receivers: [{ receiverId: student._id, receiverPath: "Student" }, { receiverId: student.parent, receiverPath: "Parent" }],
                    declarationAbsence: declarationAbsence._id
                }
                notify(notificationData)
            } catch (e) {
                console.log(e)
            }
        }
        return res.status(201).send({
            created: true,
            declarationAbsence
        })
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: e.message,
            message: "Server error!"
        })
    }
}

exports.deleteDeclarationAbsence = async (req, res) => {
    try {
        const { idAbsence } = req.params
        if (!idAbsence) {
            return res.status(400).send({
                error: "Bad Request"
            })
        }
        const deletedAbsence = await DeclarationAbsence.findByIdAndDelete(Types.ObjectId(idAbsence))
        if (!deletedAbsence) {
            return res.status(404).send({
                error: "Not Found!",
                message: "Declared Absence with id: " + idAbsence + " Not found!"
            })
        }
        return res.status(200).send({
            deleted: true
        })
    } catch (e) {
        return res.status(500).send({
            error: e.message,
            message: "Server errror"
        })
    }
}

exports.changeAbsenceStatus = async (req, res) => {
    try {
        const { idAbsence } = req.params
        if (!idAbsence) {
            return res.status(400).send({
                error: "Bad Request"
            })
        }
        const updatedAbsence = await DeclarationAbsence.findById(Types.ObjectId(idAbsence))
        if (!updatedAbsence) {
            return res.status(404).send({
                error: "Not Found",
                message: "Declared Absence with id: " + idAbsence + " Not found!"
            })
        }
        updatedAbsence.active = !updatedAbsence.active
        await updatedAbsence.save()
        return res.status(200).send({
            updated: true,
            updatedAbsence
        })
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: e.message,
            message: "Server Error"
        })
    }
}