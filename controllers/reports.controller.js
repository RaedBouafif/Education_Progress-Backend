const Session = require('../models/session.model')
const Teacher = require('../models/Users/teacher.model')
const Admin = require('../models/Users/admin.model')
const Student = require('../models/Users/student.model')
const Group = require('../models/group.model')
const Section = require("../models/section.model")
const Reports = require("../models/reports.model")
const Parent = require("../models/Users/parent.model")
const { Types } = require("mongoose")
const nodeMailer = require("../functions/nodeMailer")
const { notify } = require("../functions/Notify")
const { CommandStartedEvent } = require('mongodb')
const { logData } = require("../functions/logging")




// "teacher default reporter" report student from session
// need to add mailer to parent student
const transformDateTime = (d) => {

    d = d.toJSON()
    const datePart = d.split("T")[0].split("-").reverse().join("-")
    const timePart = d.split("T")[1].split(":").slice(0, 2).join(":") + "H"
    return datePart + " " + timePart
}
exports.reportStudentFromSession = async (req, res) => {
    try {
        const { sessionId, studentIds, allTheStudents, groupId, object, type, content, senderId, senderType, senderFirstName, senderLastName } = req.body
        if (!studentIds || !groupId || !content || !senderId || !object) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        //sending the mail phase
        var receivers = []
        var studentNames = []
        var report
        var notificationData
        if (!allTheStudents.length) {
            for (let studentId of studentIds) {
                const student = await Student.findById(new Types.ObjectId(studentId)).populate("parent")
                if (!student) {
                    return res.status(404).send({
                        error: "Student with id : " + studentId + " NotFound"
                    })
                }
                try {
                    nodeMailer(student.parent.email)
                } catch (e) {
                    console.log(e.message)
                }

                //ending the mail send process
                try {
                    receivers = [...receivers, { receiverId: new Types.ObjectId(studentId), receiverPath: "Student" }, { receiverId: new Types.ObjectId(student.parent._id), receiverPath: "Parent" }]
                    studentNames = [...studentNames, student.firstName + " " + student.lastName]
                } catch (e) {
                    console.log(e)
                }
            }
            report = await Reports.create({
                object,
                session: sessionId || null,
                students: studentIds?.map((element) => new Types.ObjectId(element)),
                type: type || null,
                content: content,
                sender: { id: senderId, senderType: senderType.toLowerCase() || "admin", senderFirstName: senderFirstName || null, senderLastName: senderLastName || null }
            })
            report = await Reports.populate(report, [
                { path: "students", select: { password: 0 } },
                { path: "groups", populate: { path: "section" } }
            ])
            notificationData = {
                report: new Types.ObjectId(report._id),
                object: `Rapport${report.type != "autre" ? " " + report.type : ""} pour : ${studentNames.join(" , ")}`,
                notificationType: "report",
                receivers,
                content: `${report.object}\n\n${report.content}`,
                seen: false,
                sender: { senderId: new Types.ObjectId(senderId), senderPath: senderType }

            }
            notify(notificationData)
        }
        else {
            for (let studentId of allTheStudents) {
                const student = await Student.findById(new Types.ObjectId(studentId)).populate("parent")
                if (!student) {
                    return res.status(404).send({
                        error: "Student with id : " + studentId + " NotFound"
                    })
                }
                try {
                    nodeMailer(student.parent.email)
                } catch (e) {
                    console.log(e.mes)
                }

                //ending the mail send process
                try {
                    receivers = [...receivers, { receiverId: new Types.ObjectId(studentId), receiverPath: "Student" }, { receiverId: new Types.ObjectId(student.parent._id), receiverPath: "Parent" }]
                    studentNames = [...studentNames, student.firstName + " " + student.lastName]
                } catch (e) {
                    console.log(e)
                }
            }
            report = await Reports.create({
                object,
                session: sessionId || null,
                groups: [new Types.ObjectId(groupId)],
                type: type || null,
                content: content,
                sender: { id: senderId, senderType: senderType.toLowerCase() || "admin", senderFirstName: senderFirstName || null, senderLastName: senderLastName || null }
            })
            report = await Reports.populate(report, [
                { path: "students", select: { password: 0 } },
                { path: "groups", populate: { path: "section" } }
            ])
            try {
                notificationData = {
                    report: new Types.ObjectId(report._id),
                    object: `Rapport${report.type != "autre" ? " " + report.type : ""} pour : ${studentNames.join(" , ")}`,
                    notificationType: "report",
                    receivers,
                    content: `${report.object}\n\n${report.content}`,
                    seen: false,
                    sender: { senderId: new Types.ObjectId(senderId), senderPath: senderType }
                }
                notify(notificationData)
            } catch (e) {
                console.log(e)
            }
        }
        if (!report) {
            return res.status(400).send({
                error: "Some error occured while saving the report"
            })
        }
        //sending the mail
        console.log(report)
        try {
            logData({ modelId: report._id, modelPath: "Report", action: "Sent report: " + report._id.toString() })
        } catch (e) {
            console.log(e.message)
        }
        return res.status(200).send(report)
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}



exports.reportActors = async (req, res) => {
    try {
        var { reportedIds, object, type, content, senderId, senderType, senderFirstName, senderLastName } = req.body
        if (!reportedIds || !content || !senderId || !object) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        // need to change after redux
        var reported = {}
        reported["teacher"] = reportedIds.filter((element) => element.actor === "Teacher")
        reported["parent"] = reportedIds.filter((element) => element.actor === "Parent")
        reported["student"] = reportedIds.filter((element) => element.actor === "Student")
        //sending the mail phase
        var report
        var reportedNames = []
        var receivers = []
        for (let student of reported["student"]) {
            const foundStudent = await Student.findById(new Types.ObjectId(student._id)).populate({ path: "parent", select: { password: 0 } })
            if (!foundStudent) {
                console.log("parent not found")
            }
            try {
                nodeMailer(foundStudent.parent.email)
            } catch (e) {
                console.log(e.mes)
            }
            receivers = [...receivers, { receiverId: new Types.ObjectId(student._id), receiverPath: "Student" }, { receiverId: new Types.ObjectId(foundStudent.parent._id), receiverPath: "Parent" }]
            //ending the mail send process
            reportedNames = [...reportedNames, foundStudent.firstName + " " + foundStudent.lastName]
        }
        for (let teacher of reported["teacher"]) {
            const reportedTeacher = await Teacher.findById(new Types.ObjectId(teacher._id))
            if (!reportedTeacher) {
                console.log("teacher not found")
            }
            try {
                nodeMailer(reportedTeacher.email)
            } catch (e) {
                console.log(e.mes)
            }
            //ending the mail send process
            receivers = [...receivers, { receiverId: new Types.ObjectId(teacher._id), receiverPath: "Teacher" }]
            reportedNames = [...reportedNames, reportedTeacher.firstName + " " + reportedTeacher.lastName]
        }
        for (let parent of reported["parent"]) {
            const foundParent = await Parent.findById(new Types.ObjectId(parent._id))
            try {
                nodeMailer(foundParent.email)

            } catch (e) {
                console.log(e.mes)
            }
            receivers = [...receivers, { receiverId: new Types.ObjectId(parent._id), receiverPath: "Parent" }]
            reportedNames = [...reportedNames, foundParent.firstName + " " + foundParent.lastName]
        }
        report = await Reports.create({
            object,
            students: reported["student"] ? reported["student"]?.map((element) => new Types.ObjectId(element._id)) : null,
            teachers: reported["teacher"] ? reported["teacher"]?.map((element) => new Types.ObjectId(element._id)) : null,
            parents: reported["parent"] ? reported["parent"]?.map((element) => new Types.ObjectId(element._id)) : null,
            type: type || null,
            content: content,
            sender: { id: senderId, senderType: senderType.toLowerCase() || "admin", senderFirstName: senderFirstName || null, senderLastName: senderLastName || null }
        })
        report = await Reports.populate(report, [
            { path: "students", select: { password: 0 } },
            { path: "groups", populate: { path: "section" } },
            { path: "teachers", select: { password: 0 } },
            { path: "parents", select: { password: 0 } },
        ])
        try {
            var notificationData = {
                report: new Types.ObjectId(report._id),
                object: `Rapport${report.type != "autre" ? " " + report.type : ""} pour : ${reportedNames.join(" , ")}`,
                notificationType: "report",
                receivers,
                content: `${report.object}\n${report.content}`,
                seen: false,
                sender: { senderId: new Types.ObjectId(senderId), senderPath: senderType }
            }
            notify(notificationData)
        } catch (e) {
            console.log(e)
        }
        if (!report) {
            return res.status(400).send({
                error: "Some error occured while saving the report"
            })
        }
        //sending the mail
        console.log(report)
        try {
            logData({ modelId: report._id, modelPath: "Report", action: "Sent report: " + report._id.toString() })
        } catch (e) {
            console.log(e.message)
        }
        return res.status(200).send(report)
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}


exports.getSessionReports = async (req, res) => {
    try {
        const { sessionId } = req.params
        const reports = await Reports.find({ session: sessionId }).sort({ createdAt: -1 })
            .populate({ path: "students", select: { password: 0 } })
            .populate({ path: "groups", populate: { path: "section" } })
        if (reports?.length) {
            return res.status(200).json(reports)
        } else {
            return res.status(204).json({
                found: false
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}
exports.getAllReports = async (req, res) => {
    try {
        var reports = await Reports.find().sort({ createdAt: -1 })
        reports = await Reports.populate(reports, [
            { path: "students", select: { password: 0 } },
            { path: "groups", populate: { path: "section" } },
            { path: "teachers", select: { password: 0 } },
            { path: "parents", select: { password: 0 } },
        ])
        if (reports.length) {
            return res.status(200).json(reports)
        }
        else {
            return res.status(204).json([])
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            error: "serverSideError"
        })
    }
}


// "student default reported" report teachcer from session
// need to add mailer
exports.reportTeacherFromSession = async (req, res) => {
    try {
        const { sessionId, teacherId, type, content, senderId, senderType, senderFirstName, senderLastName } = req.body
        if (!sessionId || !teacherId || !content || !senderId) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        const report = Reports.create({
            session: sessionId,
            teacher: teacherId,
            type: type || null,
            content: content,
            sender: { id: senderId, senderType: senderType || "admin", senderFirstName: senderFirstName || null, senderLastName: senderLastName || null }
        })
        await report.save()
        if (!report) {
            return res.status(400).send({
                error: "Some error occured while saving the report"
            })
        }
        try {
            logData({ modelId: report._id, modelPath: "Report", secondModelId: Types.ObjectId(teacherId), secondModelPath: "Teacher", action: "Sent report: " + report._id.toString() + " on Teacher: " + teacherId })
        } catch (e) {
            console.log(e.message)
        }
        return res.status(200).send(report)
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}


// "teacher/admin default reported" report groups 
// need to add mailer to parents
exports.reportGroupsFromSession = async (req, res) => {
    try {
        const { groups, type, content, senderId, senderType, senderFirstName, senderLastName } = req.body
        if (!groups || !content || !senderId) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        groups = groups.map(element => Types.ObjectId(element))
        const report = Reports.create({
            groups: groups,
            type: type || null,
            content: content,
            sender: { id: senderId, senderType: senderType || "admin", senderFirstName: senderFirstName || null, senderLastName: senderLastName || null }
        })
        await report.save()
        if (!report) {
            return res.status(400).send({
                error: "Some error occured while saving the report"
            })
        }
        try {
            logData({ modelId: report._id, modelPath: "Report", /*User with id 251551515, */ action: "Sent report: " + report._id.toString() })
        } catch (e) {
            console.log(e.message)
        }
        return res.status(200).send(report)
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}

// "admin default reported" report groups 
// need to add mailer to parents
exports.reportSectionsFromSession = async (req, res) => {
    try {
        const { sections, type, content, senderId, senderType, senderFirstName, senderLastName } = req.body
        if (!sections || !content || !senderId) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        sections = sections.map(element => Types.ObjectId(element))
        const report = Reports.create({
            sections: sections,
            type: type || null,
            content: content,
            sender: { id: senderId, senderType: senderType || "admin", senderFirstName: senderFirstName || null, senderLastName: senderLastName || null }
        })
        await report.save()
        if (!report) {
            return res.status(400).send({
                error: "Some error occured while saving the report"
            })
        }
        try {
            logData({ modelId: report._id, modelPath: "Report", /*User with id 251551515, */ action: " Sent report: " + report._id.toString() })
        } catch (e) {
            console.log(e.message)
        }
        return res.status(200).send(report)
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}


exports.sendMail = async (req, res) => {
    try {
        console.log("pending...")
        await nodeMailer("raed.boafif@gmail.com")
        console.log("success")
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server error"
        })
    }
}