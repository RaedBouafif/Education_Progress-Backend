const Session = require('../models/session.model')
const Teacher = require('../models/Users/teacher.model')
const Classroom = require('../models/classroom.model')
const Subject = require('../models/subject.model')
const Group = require('../models/group.model')
const Admin = require('../models/Users/admin.model')
const
 
// create a new session
exports.createSession = async (req,res) => {
    try {
        const session = await Session.create(req.body)
        session.save().then( data => {
            return res.status(201).send({
                data,
                created : true
            })
        }).catch( err => {
            return res.status(400).send({
                error : err.message,
                message : " Some Error occured while creating the Session!"
            })
        })
    }catch(e) {
        // Required handling
        console.log(e)
        if (e.code === 11000){
            return res.status(400).send({
                error : "Bad Request!!!!"
            })
        } else if (e.errors?.teacher?.properties.message === 'teacherRequired'){
            return res.status(400).send({
                error : "teacherRequired",
                message : "Teacher is Required!"
            })
        } else if (e.errors?.classroom?.properties.message === 'classroomRequired') {
            return res.status(400).send({
                error : "classroomRequired",
                message : "Classroom is Required!"
            })
        } else if (e.errors?.subject?.properties.message === 'subjectRequired') {
            return res.status(400).send({
                error : "subjectRequired",
                message : "Subject is Required!"
            })
        } else if (e.errors?.group?.properties.message === 'groupRequired'){
            return res.status(400).send({
                error : "groupRequired",
                message : "Group is Required!"
            })
        } else if (e.errors?.startsAt?.properties.message === 'startAtRequired') {
            return res.status(400).send({
                error : "startAtRequired",
                message : "Starting Date of Session is Required!"
            })
        } else if (e.errors?.endsAt?.properties.message === 'endsAtRequired') {
            return res.status(400).send({
                error : "endsAtRequired",
                message : "Ending Date of Session is Required!"
            })
        } else if (e.errors?.sessionType?.properties.message === 'sessionTypeRequired') {
            return res.status(400).send({
                error : "sessionTypeRequired",
                message : "Session Type is Required!"
            })
        } else if (e.errors?.sessionCategorie?.properties.message === 'sessionCategorieRequired'){
            return res.status(400).send({
                error : "sessionCategorieRequired",
                message : "Session Categorie Required!"
            })
        } else if (e.errors?.createdBy?.properties.message === 'createdByRequired'){
            return res.status(400).send({
                error : "createdByRequired",
                message : "The Creator of Session is Required!"
            })
        } else if (e.erros?.sessionType?.kind === "enum"){
            return res.status(400).send({
                error: "sessionTypeEnum",
                message: "Session type can be only 'COUR' or 'TP' ",
            });
        } else if (e.erros?.sessionCategorie?.kind === "enum"){
            return res.status(400).send({
                error: "sessionCategorieEnum",
                message: "Session Categorie can be only 'Manual' or 'Template' ",
            });
        }
        return res.status(500).send({
            error : e.message,
            message : "Server ERROR!"
        })
    }
}

// find All sessions 
exports.findSessions = async (req,res) => {
    try{
        const sessions = await Session.find(req.body)
        .populate({path :'teacher' , select : {firstName : 1, lastName : 1}})
        .populate( {path : 'group' , select : {groupName : 1}, populate : { path : 'section', selecet :{sectionName : 1}}})
        .populate( {path : 'classroom', select : { classroomName : 1, type : 1}})
        .populate( {path : 'subject', select : { subjectName : 1}})
        .populate( {})
        console.log(sessions)
    }catch(e){
        return res.status(500).send({
            error : e.message,
            message : "Server ERROR!"
        })
    }

}