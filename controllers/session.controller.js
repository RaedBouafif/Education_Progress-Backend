const Session = require('../models/session.model')
const Teacher = require('../models/Users/teacher.model')
const Classroom = require('../models/classroom.model')
const Subject = require('../models/subject.model')
const Group = require('../models/group.model')
const Admin = require('../models/Users/admin.model')
const Planning = require('../models/Planning.model')




// startedSession
exports.startingSession = async (req,res) =>{
    try{
        //StartedAt is a number , if it should be a date .....
        const { sessionId, startedAt } = req.params.sessionId
        if (!sessionId ){
            return res.status(400).send({
                error : "BadRequest"
            })
        }
        const sessionStarted = await Session.findByIdAndUpdate(sessionId, { startedAt : startedAt}, { new : true, runValidators : true})
        return res.status(200).send(sessionStarted)
    }catch(e){
        console.log(e)
        return res.status(500).send({
            error : "Server Error"
        })
    } 
} 

// startedSession
exports.endingSession = async (req,res) =>{
    try{
        //StartedAt is a number , if it should be a date .....
        const { sessionId, endedAt } = req.params.sessionId
        if (!sessionId ){
            return res.status(400).send({
                error : "BadRequest"
            })
        }
        const sessionStarted = await Session.findByIdAndUpdate(sessionId, { endedAt : endedAt}, { new : true, runValidators : true})
        return res.status(200).send(sessionStarted)
    }catch(e){
        console.log(e)
        return res.status(500).send({
            error : "Server Error"
        })
    } 
} 

// get all sessionDetails
exports.getSessionDetails = async (req,res) => {
    const { sessionId, groupId } = req.params.sessionId
    try{
        if (!sessionId){
            return res.status(400).send({
                error : "BadRequest"
            })
        }
        const sessionInfos = await Session.findById(sessionId)
            .populate({ path : "teacher", select : { password : 0}})
            .populate({ path: "subTeacher", select: { password: 0 } })
            .populate("subject")
            .populate("classroom")
        const listOfStudents = await Group.findById(groupId)
            .populate({ path : "students", select: { password : 0, username : 0}})
        if (!listOfStudents){
            return res.status(404).send({
                error : "groupNotFound"
            })
        }
        return res.status(200).send({
            infos : sessionInfos,
            students : listOfStudents
        })
    }catch(e){
        console.log(e)
        return res.status(500).send({
            error : "Server Error"
        })
    }
}



//



// // Create a new Template Session
// exports.createTemplateSession = async (req, res) => {
//     try {
//         const session = await Session.create({...req.body, sessionCategorie : "template"})
//         session.save().then( data => { 
//             return res.status(201).send({
//                 data,
//                 created: true
//             })
//         }).catch(err => {
//             return res.status(400).send({
//                 error: err.message,
//                 message: " Some Error occured while creating the Session!"
//             })
//         })
//     } catch (e) {
//         // Required handling
//         console.log(e)
//         if (e.code === 11000) {
//             return res.status(409).send({
//                 error: "BadRequest"
//             })
//         } else if (e.errors?.teacher?.properties.message === 'teacherRequired') {
//             return res.status(400).send({
//                 error: "teacherRequired",
//                 message: "Teacher is Required!"
//             })
//         } else if (e.errors?.classroom?.properties.message === 'classroomRequired') {
//             return res.status(400).send({
//                 error: "classroomRequired",
//                 message: "Classroom is Required!"
//             })
//         } else if (e.errors?.subject?.properties.message === 'subjectRequired') {
//             return res.status(400).send({
//                 error: "subjectRequired",
//                 message: "Subject is Required!"
//             })
//         } else if (e.errors?.group?.properties.message === 'groupRequired') {
//             return res.status(400).send({
//                 error: "groupRequired",
//                 message: "Group is Required!"
//             })
//         } else if (e.errors?.startsAt?.properties.message === 'startAtRequired') {
//             return res.status(400).send({
//                 error: "startAtRequired",
//                 message: "Starting Date of Session is Required!"
//             })
//         } else if (e.errors?.endsAt?.properties.message === 'endsAtRequired') {
//             return res.status(400).send({
//                 error: "endsAtRequired",
//                 message: "Ending Date of Session is Required!"
//             })
//         } else if (e.errors?.sessionType?.properties.message === 'sessionTypeRequired') {
//             return res.status(400).send({
//                 error: "sessionTypeRequired",
//                 message: "Session Type is Required!"
//             })
//         } else if (e.errors?.sessionCategorie?.properties.message === 'sessionCategorieRequired') {
//             return res.status(400).send({
//                 error: "sessionCategorieRequired",
//                 message: "Session Categorie Required!"
//             })
//         } else if (e.errors?.createdBy?.properties.message === 'createdByRequired') {
//             return res.status(400).send({
//                 error: "createdByRequired",
//                 message: "The Creator of Session is Required!"
//             })
//         } else if (e.errors?.sessionType?.kind === "enum") {
//             return res.status(400).send({
//                 error: "sessionTypeEnum",
//                 message: "Session type can be only 'COUR' or 'TP' ",
//             });
//         } else if (e.errors?.sessionCategorie?.kind === "enum") {
//             return res.status(400).send({
//                 error: "sessionCategorieEnum",
//                 message: "Session Categorie can be only 'Manual' or 'Template' ",
//             });
//         } else if (e.errors?.active?.kind === 'Boolean') {
//             return res.status(400).send({
//                 error: "Active attribute should be a Boolean value"
//             })
//         }
//         return res.status(500).send({
//             error: e.message,
//             message: "Server ERROR!"
//         })
//     }
// }


// // create a new Manual Session
// exports.createManualSession = async (req, res) => {
//     try {
//         /************************ 
//         in my request i have all the Session attirubtes needed 
//         and i have the current week and the current semester and the current group
//         and an added attribute in the request called numberOfWeeks 
//         *************************/
//         const {
//             teacher,
//             classroom,
//             subject,
//             group,
//             day,
//             startsAt,
//             endsAt,
//             sessionType,
//             sessionCategorie,
//             createdBy,
//             week,
//             semesterId,
//         } = req.body
//         // i gonna test only on numberOfWekks and semester and the week is sent or not because the others are in the catch
//         if (!week || !semesterId) {
//             return res.status(400).send({
//                 error: "BadRequest"
//             })
//         }
//         const newSession = await Session.create({
//             teacher: teacher,
//             classroom: classroom,
//             subject: subject,
//             group: group,
//             day: day,
//             startsAt: startsAt,
//             endsAt: endsAt,
//             sessionType: sessionType,
//             sessionCategorie: "manual",
//             createdBy: createdBy
//         })
//         await newSession.save()
//         // next week
//         const nextWeek = Number(week) + 1
//         const date = new Date()
//         if ((date.getDay() > day) || (date.getDay() == day && date.getHours() > startsAt)) {
//             const ExistingPlanniung = await Planning.findOne({ week: nextWeek, semester: semesterId, group: group })
//             if (ExistingPlanniung) {
//                 ExistingPlanniung.sessions.push(newSession._id)
//                 await ExistingPlanniung.save()
//                 return res.status(200).send({
//                     ExistingPlanniung,
//                     creatred: true
//                 })
//             } else {
//                 const newPlanning = await Planning.create({
//                     week: nextWeek,
//                     group: group,
//                     semester: semesterId,
//                     sessions: [newSession.id]
//                 })
//                 await newPlanning.save()
//                 return res.status(200).send({
//                     newPlanning,
//                     created: true
//                 })
//             }
//         } else {
//             const currentPlanning = await Planning.findOneAndUpdate(
//                 { week: week, semester: semesterId, group: group },
//                 { $push: { sessions: newSession._id } },
//                 { new: true, runValidators: true },
//             )
//             await currentPlanning.save()
//             return res.status(200).send({
//                 currentPlanning,
//                 created: true
//             })
//         }
//     } catch (e) {
//         // Required handling
//         console.log(e)
//         if (e.code === 11000) {
//             return res.status(400).send({
//                 error: "Bad Request!!!!"
//             })
//         } else if (e.errors?.teacher?.properties.message === 'teacherRequired') {
//             return res.status(400).send({
//                 error: "teacherRequired",
//                 message: "Teacher is Required!"
//             })
//         } else if (e.errors?.classroom?.properties.message === 'classroomRequired') {
//             return res.status(400).send({
//                 error: "classroomRequired",
//                 message: "Classroom is Required!"
//             })
//         } else if (e.errors?.subject?.properties.message === 'subjectRequired') {
//             return res.status(400).send({
//                 error: "subjectRequired",
//                 message: "Subject is Required!"
//             })
//         } else if (e.errors?.group?.properties.message === 'groupRequired') {
//             return res.status(400).send({
//                 error: "groupRequired",
//                 message: "Group is Required!"
//             })
//         } else if (e.errors?.startsAt?.properties.message === 'startAtRequired') {
//             return res.status(400).send({
//                 error: "startAtRequired",
//                 message: "Starting Date of Session is Required!"
//             })
//         } else if (e.errors?.endsAt?.properties.message === 'endsAtRequired') {
//             return res.status(400).send({
//                 error: "endsAtRequired",
//                 message: "Ending Date of Session is Required!"
//             })
//         } else if (e.errors?.sessionType?.properties.message === 'sessionTypeRequired') {
//             return res.status(400).send({
//                 error: "sessionTypeRequired",
//                 message: "Session Type is Required!"
//             })
//         } else if (e.errors?.sessionCategorie?.properties.message === 'sessionCategorieRequired') {
//             return res.status(400).send({
//                 error: "sessionCategorieRequired",
//                 message: "Session Categorie Required!"
//             })
//         } else if (e.errors?.createdBy?.properties.message === 'createdByRequired') {
//             return res.status(400).send({
//                 error: "createdByRequired",
//                 message: "The Creator of Session is Required!"
//             })
//         } else if (e.errors?.sessionType?.kind === "enum") {
//             return res.status(400).send({
//                 error: "sessionTypeEnum",
//                 message: "Session type can be only 'COUR' or 'TP' ",
//             });
//         } else if (e.errors?.sessionCategorie?.kind === "enum") {
//             return res.status(400).send({
//                 error: "sessionCategorieEnum",
//                 message: "Session Categorie can be only 'Manual' or 'Template' ",
//             });
//         } else if (e.errors?.active?.kind === 'Boolean') {
//             return res.status(400).send({
//                 error: "Active attribute should be a Boolean value"
//             })
//         }
//         return res.status(500).send({
//             error: e.message,
//             message: "Server ERROR!"
//         })
//     }
// }

// // find All sessions 
// exports.findSessions = (req, res) => {
//     try {
//         Session.find(req.body)
//             .populate({ path: 'teacher', select: { firstName: 1, lastName: 1 } })
//             .populate({ path: 'group', select: { groupName: 1 }, populate: { path: 'section', selecet: { sectionName: 1 } } })
//             .populate({ path: 'classroom', select: { classroomName: 1, type: 1 } })
//             .populate({ path: 'subject', select: { subjectName: 1 } })
//             .then(sessions => {
//                 return res.status(200).send({
//                     sessions,
//                     found: true
//                 })
//             }).catch(err => {
//                 return res.status(400).send({
//                     error: err.message,
//                     message: "Some ERROR occured while finding the Sessions"
//                 })
//             })
//     } catch (e) {
//         return res.status(500).send({
//             error: e.message,
//             message: "Server ERROR!"
//         })
//     }
// }

// // find Session by Id
// exports.findSessionById = (req, res) => {
//     try {
//         if (!req.params.sessionId) {
//             return res.status(400).send({
//                 error: "Bad Request!"
//             })
//         }
//         Session.findById(req.params.sessionId)
//             .populate({ path: 'teacher', select: { firstName: 1, lastName: 1 } })
//             .populate({ path: 'group', select: { groupName: 1 }, populate: { path: 'section', selecet: { sectionName: 1 } } })
//             .populate({ path: 'classroom', select: { classroomName: 1, type: 1 } })
//             .populate({ path: 'subject', select: { subjectName: 1 } })
//             .then(session => {
//                 if (!session) {
//                     return res.status(404).send({
//                         error: "Session with id " + req.params.sessionId + " Not Found!!",
//                         found: false
//                     })
//                 }
//                 return res.status(200).send({
//                     session,
//                     found: true
//                 })
//             }).catch(err => {
//                 if (err.kind === "ObjectId" || err.name === "NotFound") {
//                     return res.status(404).send({
//                         error: "Session with id " + req.params.sessionId + " Not Found!"
//                     })
//                 }
//                 return res.status(400).send({
//                     error: err.message,
//                     message: "Some Error occured while finding the session with id " + req.params.sessionId
//                 })
//             })
//     } catch (e) {
//         return res.status(500).send({
//             error: e.message,
//             message: "Server Error!"
//         })
//     }
// }


// find by date find by week find by ..........................................



