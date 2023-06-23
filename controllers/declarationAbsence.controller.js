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


exports.createDeclaration = async (req, res) => {
    try {
        const { dateDeb, dateFin, description, studentId, teacherId, active } = req.body
        if ((!dateDeb) || (!dateFin)) {
            return res.status(400).send({
                error: "Bad Request"
            })
        }
        const token = req.cookies?.tck
        if (!token) {
            res.clearCookie('tck')
            return res.status(403).json({
                "name": "NoTokenProvided"
            })
        } else {
            try {
                const decoded = jwt.verify(token, process.env.TOKEN_KEY)
                const senderId = decoded._id
                const senderPath = ["admin", "super", "owner"].includes(decoded.role) ? "Admin" : "Teacher"
                var adminNotification = {}
                var notificationData = {
                    active: active,
                    notificationType: "teacherAbsenceDeclared"
                }
                var finalDateDeb = new Date(dateDeb)
                var finalDateFin = new Date(dateFin)
                const declarationAbsence = await DeclarationAbsence.create({
                    student: Types.ObjectId(studentId) || null,
                    teacher: Types.ObjectId(teacherId) || null,
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
                    const admins = await Admin.find({})
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
                        // const sessions = plannings[i].sessions?.filter((element) => Array.isArray(element) && element.length).length ? plannings[i].sessions.filter((element) => Array.isArray(element.sessions)) : []
                        const sessions = plannings[i].sessions
                        for (let j = 0; j < sessions.length; j++) {
                            if (sessions[j]) {
                                currentSession = sessions[j]
                                var planning_starting_date = new Date(planning_starting)
                                planning_starting_date.setDate(planning_starting_date.getDate() + currentSession.day)
                                planning_starting_date.setUTCHours(0, 0, 0, 0)
                                console.log(planning_starting_date)
                                var session_endsAt = planning_starting_date
                                planning_starting_date.setMinutes(planning_starting_date.getMinutes() + currentSession.startsAt)
                                session_endsAt.setMinutes(planning_starting_date.getMinutes() + currentSession.endsAt)
                                if (finalDateDeb <= planning_starting_date && finalDateFin >= session_endsAt) {
                                    consernedSessions.push(currentSession)
                                    currentSession.suspended = true
                                    const sessionTOSave = await Admin.create(currentSession)
                                    await currentSession.save()
                                }
                            }
                        }
                    }
                    console.log(consernedSessions)
                    try {
                        notificationData = {
                            ...notificationData,
                            active: active,
                            object: "Absence d'enseignant: " + teacher.firstName.toUpperCase() + " " + teacher.lastName.toUpperCase(),
                            content: `L'enseignant ${teacher.firstName} ${teacher.lastName} sera absent à partir de le date: ${dateDeb} jusqu'a le date: ${dateFin}`,
                            sender: { senderPath: senderPath, senderId: senderId },
                            receivers:
                                [{ receiverId: teacher._id, receiverPath: "Teacher" },
                                ...(consernedSessions.group?.students ? consernedSessions.group?.students.map((element) => ({ receiverId: new Types.ObjectId(element), receiverPath: "Student" })) : []),
                                admins ? admins.map((element) => ({ receiverId: element._id, receiverPath: receiverPath })) : []
                                ],
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
                            sender: { senderPath: ["admin", "owner", "super"].includes(req.body["decodedToken"].role) ? "Admin" : "Teacher", senderId: req.body["decodedToken"]._id },
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
                res.clearCookie('tck')
                return res.status(406).json(e)
            }
        }
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