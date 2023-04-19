

const StudentPresence = require("../models/studentPresence.model")
const  Group = require("../models/group.model")
const Session = require("../models/session.model")
const StudentAbsence = require("../models/studentAbsence.model")

//studentPresence
exports.saveStudentPresence = async (req,res) => {
    try{
        const { studentId, sessionId, groupId, dateEntry, dateLeave, collegeYear } = req.body
        if (!studentId || !sessionId || !groupId || !collegeYear){
            return res.status(400).send({
                error : "BadRequest"
            })
        }
        const activatedPresence = await StudentPresence.findOneAndUpdate({ session : sessionId, student : studentId}, { active : true}, { new : true})
        if (activatedPresence){
            return res.status(200).send(activatedPresence)
        }
        const presence = await StudentPresence.create({
            student : studentId,
            group: groupId,
            session: sessionId,
            dateEntry: new Date(dateEntry) || null,
            dateLeave: new Date(dateLeave) || null,
            extra : extra || false,
            collegeYear : collegeYear,
            active : true
        })
        await presence.save()
        await StudentPresence.findOneAndUpdate({ session : sessionId, student : studentId}, { active : false}, { new : true})
        return res.status(200).send(presence)
    }catch(e) {
        console.log(e)
        return res.status(500).send({
            error : "Server ERROR"
        })
    }
}

//studentAbsence
exports.saveStudentAbsence = async (req,res) => {
    try{
        const { studentId, sessionId, groupId, collegeYear, justified} = req.body
        if (!studentId || !sessionId || !groupId || !collegeYear){
            return res.status(400).send({
                error : "BadRequest"
            })
        }
        const activatedAbsence = await StudentAbsence.findOneAndUpdate({ session : sessionId, student : studentId}, { active : true}, { new : true})
        if (activatedAbsence){
            return res.status(200).send(activatedAbsence)
        }
        const absence = await StudentAbsence.create({
            student : studentId,
            group: groupId,
            session: sessionId,
            justified : justified || false,
            collegeYear: collegeYear,
            active: true
        })
        await absence.save()
        await StudentPresence.findOneAndUpdate({ session : sessionId, student : studentId}, { active : false}, { new : true})
        return res.status(200).send(absence)
    }catch(e) {
        console.log(e)
        return res.status(500).send({
            error : "Server ERROR"
        })
    }
}


//student Presence by collegeYear
exports.getStudentPresencesByYear = async (req, res) => {
    // select using request body dropdown with semester date begin date end
    try {
        const { studentId, collegeYear } = req.params
        if (!studentId){
            return res.status(400).send({
                error : "BadRequest"
            })
        }
        const sessionPresence = await StudentPresence.find({ student : studentId, collegeYear : collegeYear })
            .populate({ path: "student", select: { password: 0 } })
            .populate({ path: "session", populate: [{ path: "subject" }, { path: "teacher", select : { password : 0 } }, {path : "classroom"}]})
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

//justify an absence
exports.justifyAbsence = async (req,res) => {
    try{
        const {absenceId} = req.params
        if (!absenceId){
            return res.status(400).send({
                error : "BadRequest"
            })
        }
        const justifiedAbsence = await StudentAbsence.findByIdAndUpdate(absenceId, { justified : true}, {new: true, runValidators : true})
        if(!justifiedAbsence){
            return res.status(404).send({
                error : "AbsenceNotFound"
            })
        }
        return res.status(200).send(justifiedAbsence)
    }catch(e){
        console.log(e)
        return res.status(500).send({
            error : "Server ERROR"
        })
    }
}




//find all students absence and presnece par session
exports.getStudentsAbsenceAndPresence = async(req,res) => {
    try{
        const sessionId = req.params.sessionId
        if (!sessionId){
            return res.status(400).send({
                error : "BadRequest"
            })
        }
        const studentsAbsence = await StudentAbsence.find({session : sessionId, active : true})
        const studentsPresence = await StudentPresence.find({ session : sessionId, active : true})
        if (!studentsAbsence){
            return res.status(204).send({
                absence : true
            })
        }
        if (!studentsPresence){
            return res.status(204).send({
                presence : true
            })
        }
        return res.status(200).send({
            studentsAbsence,
            studentsPresence
        })
    }catch(e){
        console.log(e)
        return res.status(500).send({
            error : "Server Error"
        })
    }
}







// exports.saveStudentPresence = async (req, res) => {
//     try {
//         //{sessionId : "1215qsd" , groupId :"15564qsd" , students : [ids] }
//         const { students, sessionId, groupId } = req.body //sent only present students 
//         if (!sessionId || !groupId)
//             return res.status(400).json({
//                 error: "badRequired",
//                 message: !sessionId ? "session ID required required" : "group ID required required"
//             })
//         if (students.length) {
//             const data = students.map((element) => { return { student: element, session: sessionId } })
//             console.log(data)
//             const sessionPresence = await StudentPresence.create(data)
//             for (var s of sessionPresence) {
//                 await s.save()
//             }
//         }
//         const group = await GroupModel.findById(groupId)
//         var absentStudent = group.students.filter((element) => students.map((std) => std._id).indexOf(element) === -1)
//         console.log(absentStudent)
//         if (absentStudent.length) {
//             absentStudent = absentStudent.map((element) => { return { student: element, session: sessionId } })
//             absentStudent = await StudentAbsence.create(absentStudent)
//             for (var s of absentStudent) {
//                 await s.save()
//             }
//         }
//         return res.status(201).json({
//             absentStudent
//         })
//     } catch (e) {
//         console.log(e)
//         if (e.code === 11000) {
//             return res.status(409).json({
//                 error: "conflict",
//             })
//         }
//         return res.status(500).json({
//             error: "serverSideError"
//         })
//     }
// }

// exports.getStudentPresence = async (req, res) => {
//     // select using request body dropdown with semester date begin date end
//     try {
//         const sessionPresence = await StudentPresence.find({ ...req.body, createdAt: { $gte: new Date(req.body.beginDate), $lte: new Date(req.body.endDate) } })
//             .populate({ path: "student", select: { password: 0 } })
//             .populate({ path: "session", populate: [{ path: "subject" }, { path: "teacher" }], })
//         return sessionPresence.length
//             ? res.status(200).json({
//                 found: true,
//                 sessionPresence
//             })
//             : res.status(204).json({
//                 found: false
//             })
//     } catch (e) {
//         console.log(e)
//         return res.status(500).json({
//             error: "serverSideError"
//         })
//     }
// }

// exports.getStudentAbsence = async (req, res) => {
//     //select using request body , session , student , justified)
//     //dropdown with semester dateBegin dateEnd
//     try {
//         const absence = await StudentAbsence.find({ ...req.body, createdAt: { $gte: new Date(req.body.beginDate), $lte: new Date(req.body.endDate) } })
//             .populate({ path: "student", select: { password: 0 } })
//             .populate({ path: "session", populate: [{ path: "subject" }, { path: "teacher", select: { password: 0 } }], })
//         return absence.length
//             ? res.status(200).json({
//                 found: true,
//                 absence
//             })
//             : res.status(204).json({
//                 found: false,
//             })
//     } catch (e) {
//         console.log(e)
//         return res.status(500).json({
//             error: "serverSideError"
//         })
//     }
// }


// exports.justifyStudentAbsence = async (req, res) => {
//     try {
//         const absence = await StudentAbsence.findByIdAndUpdate(req.params.absenceId, { justified: true }, { new: false, runValidators: true })
//         if (absence) {
//             if (absence.justified) {
//                 return res.status(200).json({
//                     updated: true,
//                     message: "absence has already justified"
//                 })
//             }
//             else {
//                 return res.status(200).json({
//                     updated: true,
//                     message: "absence has been justified"
//                 })
//             }
//         }
//         else {
//             return res.status(404).json({
//                 updated: false
//             })
//         }

//     } catch (e) {
//         console.log(e)
//         return res.status(500).json({
//             error: "serverSideError"
//         })
//     }
// }