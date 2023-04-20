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
const { CommandStartedEvent } = require('mongodb')



// "teacher default reporter" report student from session
// need to add mailer to parent student
exports.reportStudentFromSession = async (req, res) => {
    try {
        const { sessionId, studentIds, allTheStudents, groupId, object, type, content, senderId, senderType, senderFirstName, senderLastName } = req.body
        if (!studentIds || !groupId || !content || !senderId || !object) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        //sending the mail phase
        var report
        if (!allTheStudents.length) {
            for (let studentId of studentIds) {
                const student = await Student.findById(new Types.ObjectId(studentId)).populate("parent")
                if (!student) {
                    return res.status(404).send({
                        error: "Student with id : " + studentId + " NotFound"
                    })
                }
                await nodeMailer(student.parent.email)
                //ending the mail send process
            }
            report = await Reports.create({
                object,
                session: sessionId || null,
                students: studentIds?.map((element) => new Types.ObjectId(element)),
                type: type || null,
                content: content,
                sender: { id: senderId, senderType: senderType || "admin", senderFirstName: senderFirstName || null, senderLastName: senderLastName || null }
            })
            report = await Reports.populate(report, [
                { path: "students", select: { password: 0 } },
                { path: "groups", populate: { path: "section" } }
            ])
        }
        else {
            for (let studentId of allTheStudents) {
                const student = await Student.findById(new Types.ObjectId(studentId)).populate("parent")
                if (!student) {
                    return res.status(404).send({
                        error: "Student with id : " + studentId + " NotFound"
                    })
                }
                await nodeMailer(student.parent.email)
                //ending the mail send process
            }
            report = await Reports.create({
                object,
                session: sessionId || null,
                groups: [new Types.ObjectId(groupId)],
                type: type || null,
                content: content,
                sender: { id: senderId, senderType: senderType || "admin", senderFirstName: senderFirstName || null, senderLastName: senderLastName || null }
            })
            report = await Reports.populate(report, [
                { path: "students", select: { password: 0 } },
                { path: "groups", populate: { path: "section" } }
            ])
        }
        if (!report) {
            return res.status(400).send({
                error: "Some error occured while saving the report"
            })
        }
        //sending the mail
        console.log(report)
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
        const { reportedIds, object, type, content, senderId, senderType, senderFirstName, senderLastName } = req.body
        if (!reportedIds || !content || !senderId || !object) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        var reported = {}
        reported["teacher"] = reportedIds.filter((element) => element.actor === "Teacher")
        reported["parent"] = reportedIds.filter((element) => element.actor === "Parent")
        reported["student"] = reportedIds.filter((element) => element.actor === "Student")
        //sending the mail phase
        var report
        for (let student of reported["student"]) {
            const parent = await Parent.findById(new Types.ObjectId(student.parent))
            if (!parent) {
                console.log("parent not found")
            }
            await nodeMailer(parent.email)
            //ending the mail send process
        }
        for (let teacher of reported["teacher"]) {
            const reportedTeacher = await Teacher.findById(new Types.ObjectId(teacher._id))
            if (!reportedTeacher) {
                console.log("teacher not found")
            }
            await nodeMailer(reportedTeacher.email)
            //ending the mail send process
        }
        report = await Reports.create({
            object,
            students: reported["student"] ? reported["student"]?.map((element) => new Types.ObjectId(element._id)) : null,
            teachers: reported["teacher"] ? reported["teacher"]?.map((element) => new Types.ObjectId(element._id)) : null,
            parents: reported["parent"] ? reported["parent"]?.map((element) => new Types.ObjectId(element._id)) : null,
            type: type || null,
            content: content,
            sender: { id: senderId, senderType: senderType || "admin", senderFirstName: senderFirstName || null, senderLastName: senderLastName || null }
        })
        report = await Reports.populate(report, [
            { path: "students", select: { password: 0 } },
            { path: "groups", populate: { path: "section" } },
            { path: "teachers", select: { password: 0 } },
            { path: "parents", select: { password: 0 } },
        ])
        if (!report) {
            return res.status(400).send({
                error: "Some error occured while saving the report"
            })
        }
        //sending the mail
        console.log(report)
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