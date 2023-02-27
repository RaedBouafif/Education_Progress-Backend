

const StudentPresence = require("../models/studentPresence.model")
const GroupModel = require("../models/group.model")
const StudentAbsence = require("../models/studentAbsence.model")


exports.saveStudentPresence = async (req, res) => {
    try {
        //{sessionId : "1215qsd" , groupId :"15564qsd" , students : [ids] }
        const { students, sessionId, groupId } = req.body //sent only present students 
        if (!sessionId || !groupId)
            return res.status(400).json({
                error: "badRequired",
                message: !sessionId ? "session ID required required" : "group ID required required"
            })
        if (students.length) {
            const data = students.map((element) => { element.session = sessionId; return element })
            console.log(data)
            const sessionPresence = await StudentPresence.create(data)
            await sessionPresence.save()
        }
        const group = await GroupModel.findById(groupId)
        var absentStudent = group.students.filter((element) => students.map((std) => std._id).indexOf(element) === -1)
        console.log(absentStudent)
        if (absentStudent.length) {
            absentStudent = absentStudent.map((element) => { element.session = sessionId; return element })
            absentStudent = await StudentAbsence.create(absentStudent)
            await sessionPresence.save()
        }
        return res.status(201).json({
            absentStudent
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            error: "serverSideError"
        })
    }
}

exports.getStudentPresence = async (req, res) => {
    // select using request body dropdown with semester date begin date end
    try {
        const sessionPresence = await StudentPresence.find({ ...req.body, createdAt: { $gte: new Date(beginDate), $lte: new Date(endDate) } })
            .populate({ path: "student", select: { password: 0 } })
            .populate({ path: "session", populate: [{ path: "subject" }, { path: "teacher" }], })
        return sessionPresence.length
            ? res.status(200).json({
                found: true,
                sessionPresence
            })
            : res.status(204).json({
                found: false
            })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            error: "serverSideError"
        })
    }
}

exports.getStudentAbsence = async (req, res) => {
    //select using request body , session , student , justified)
    //dropdown with semester dateBegin dateEnd
    try {
        const absence = await StudentAbsence.find({ ...req.body, createdAt: { $gte: new Date(beginDate), $lte: new Date(endDate) } })
            .populate({ path: "student", select: { password: 0 } })
            .populate({ path: "session", populate: [{ path: "subject" }, { path: "teacher", select: { password: 0 } }], })
        return absence.length
            ? res.status(200).json({
                found: true,
                absence
            })
            : res.status(204).json({
                found: false,
            })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            error: "serverSideError"
        })
    }
}


exports.justifyStudentAbsence = async (req, res) => {
    try {
        const absence = await StudentAbsence.findByIdAndUpdate(req.params.absenceId, { justified: true }, { new: false, runValidators: true })
        if (absence) {
            if (absence.justified) {
                return res.status(200).json({
                    updated: true,
                    message: "alreadyJustified"
                })
            }
            else {
                return res.status(200).json({
                    updated: true,
                    message: "absence has been justified"
                })
            }
        }
        else {
            return res.status(404).json({
                updated: false
            })
        }

    } catch (e) {
        console.log(e)
        return res.status(500).json({
            error: "serverSideError"
        })
    }
}