const Template = require("../models/template.model")
const Session = require("../models/session.model")
const Section = require("../models/section.model")
const Semester = require("../models/semester.model")
const CollegeYearModel = require("../models/collegeYear.model")
const GroupModel = require("../models/group.model")
const SessionModel = require("../models/session.model")
const { Types } = require("mongoose")
const PlanningModel = require("../models/Planning.model")
const Teacher = require("../models/Users/teacher.model")
const Subject = require("../models/subject.model")
const { ListCollectionsCursor } = require("mongodb")


exports.create = async (req, res) => {
    const { group, collegeYear, active } = req.body
    if (!group || !collegeYear) {
        return res.status(400).send({
            error: "BadRequest"
        })
    }
    try {
        const template = await Template.create({
            group: group,
            collegeYear: collegeYear,
            active: active || null
        })
        await template.save()
        return (template) ?
            res.status(201).send(template)
            :
            res.status(204).send({
                created: false
            })
    } catch (e) {
        if (e.code === 11000) {
            return res.status(409).send({
                error: "conflictTemplate"
            })
        }
        return res.status(500).send({
            error: "BadRequest"
        })
    }
}

exports.addSessionToTemplate = async (req, res) => {
    try {
        const { teacher, classroom, subject, group, day, startsAt, duree, sessionType, idTemplate, initialSubGroup} = req.body
        if (!teacher || !classroom || !subject || !group || !day || !startsAt || !duree || !sessionType || !idTemplate) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        const session = await Session.create({
            teacher: teacher,
            classroom:classroom,
            subject :subject,
            group : group,
            day : day,
            startsAt : startsAt,
            endsAt : startsAt + duree,
            sessionType : sessionType,
            idTemplate: idTemplate,
            initialSubGroup : initialSubGroup || "All"
        })
        await session.save()
        if (session) {
            const updatedPlanning = await Template.findByIdAndUpdate(idTemplate, { $push: { sessions: session._id } }, { new: true, runValidators: true })
                .populate("collegeYear")
                .populate({ path: "sessions", populate: [{ path: "teacher", select: { password: 0 } }, { path: "subject" }, { path: "classroom" }] })
                .populate("group")
            if (updatedPlanning) {
                return res.status(200).send({
                    updatedPlanning
                })
            } else {
                return res.status(400).send({
                    error: "TemplateError",
                    updated: false
                })
            }

        } else {
            return res.status(400).send({
                error: "SessionError",
                created: false
            })
        }
    } catch (e) {
        return res.status(500).send({
            error: "Server Error"
        })
    }
}

//update session
exports.updateSessionFromTemplate = async(req,res) => {
    try{
        const { sessionId, templateId , teacher, subject, classroom, sessionType, initialSubGroup} = req.body
        if (!sessionId || !templateId){
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        if (!initialSubGroup){
            initialSubGroup = "All"
        }
        const session = await Session.findById(sessionId)
        if (session){
            if (session.teacher != teacher || session.subject != subject || session.classroom != classroom || session.sessionType != sessionType || session.initialSubGroup != initialSubGroup){
                session.teacher = teacher
                session.subject = subject
                session.classroom = classroom
                session.sessionType = sessionType
                session.initialSubGroup = initialSubGroup
                await session.save()
                const template = await Template.findById(templateId)
                    .populate("collegeYear")
                    .populate({ path: "sessions", populate: [{ path: "teacher", select: { password: 0 } }, { path: "subject" }, { path: "classroom" }] })
                    .populate("group")
                if (!template) {
                    return res.status(400).send({
                        error: "TemplateError"
                    })
                } else {
                    return res.status(200).send({
                        template
                    })
                }
            } else {
                return res.status(304).send({
                    updated: false
                })
            }
        } else {
            return res.status(404).send({
                message: "SessionNotFound"
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}

exports.deleteSessionFromTemplate = async (req, res) => {
    try {
        const { sessionId, templateId } = req.params
        var template = await Template.findById(templateId)
        if (template) {
            console.log(template?.sessions)
            if (template?.sessions?.find((element) => element._id.toString() === sessionId)) {
                template.sessions = template.sessions.filter((element) => element.toString() !== sessionId)
                await template.save()
                await Session.findByIdAndDelete(sessionId)
                return res.status(200).json({ deleted: true })
            }
            else {
                return res.status(404).json({
                    error: "sessionNotFound"
                })
            }
        }
        else {
            return res.status(404).json({
                error: "templateNotFound"
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            error: "serverSideError"
        })
    }
}


exports.getTemplatesByGroupAndCollegeYear = async (req, res) => {
    const { group, collegeYear } = req.query
    if (!group || !collegeYear) {
        return res.status(400).send({
            error: "BadRequest"
        })
    }
    try {
        const template = await Template.findOne({ group: group, collegeYear: collegeYear }).sort({ createdAt: -1 })
            .populate({ path: "sessions", populate: [{ path: "teacher", select: { password: 0 } }, { path: "subject" }, { path: "classroom" }] })
            .populate("collegeYear")
            .populate({ path: "group", populate: { path: "section" } })
        if (template) {
            return res.status(200).send(template)
        } else {
            return res.status(404).send({
                found: false
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            return: "Server Error"
        })
    }
}

exports.getTemplatesByGroup = async (req, res) => {
    const { group } = req.query
    if (!group || !collegeYear) {
        return res.status(400).send({
            error: "BadRequest"
        })
    }
    try {
        const templates = await Template.find({ group: group }).sort({ createdAt: -1 })
            .populate("sessions")
            .populate("collegeYear")
            .populate("group")
        if (templates) {
            return res.status(200).send({
                templates
            })
        } else {
            return res.status(404).send({
                found: false
            })
        }
    } catch (e) {
        return res.status(500).send({
            return: "Server Error"
        })
    }
}


//get teacher Template
exports.getTeacherTemplate = async (req,res) => {
    try{
        const collegeYear = req.params.collegeYear
        const idTeacher = req.params.idTeacher
        if (!idTeacher || !collegeYear){
            return res.status(400).send({
                error : "BadRequest"
            })
        }
        const templates = await Template.find({collegeYear : collegeYear}, "sessions").populate({ path : "sessions", match : {teacher : idTeacher}})
        if (templates){
            teacherTemplate = templates?.filter((element) => Array.isArray(element.sessions) && element.sessions.length).length ? templates?.filter((element) => Array.isArray(element.sessions)) : []
            teacherTemplate = teacherTemplate.filter(element => element.sessions.length != 0)
            return res.status(200).send(teacherTemplate)
        }else{
            return res.status(404).send({
                error : "TemplateNotFound"
            })
        }
    }catch(e){
        console.log(e)
        return res.status(500).send({
            error : "Server Error"
        })
    }
}

//get list of Teachers par section
exports.getListOfTeachers = async (req,res) =>{
    try{
        const idSection = req.params.idSection
        if (!idSection){
            return res.status(400).send({
                error :"BadRequest"
            })
        }
        console.log(idSection)
        var listOfTeachers = await Section.findById(idSection, "subjects")
        .populate(
        { 
            path : "subjects",
            select : { subjectName : 0, active : 0 , active : 0 , description : 0, image : 0},
            populate : { path : "teachers" , select : {password: 0, email: 0, tel: 0, gender: 0, maritalStatus: 0, subjects: 0, image: 0, adresse: 0, birth : 0 }}  
        })
        if(listOfTeachers){
            listOfTeachers = listOfTeachers.subjects
            const finalTeachers = listOfTeachers.flatMap((subject) => subject.teachers);
            const uniqueTeachers = [...new Set(finalTeachers.map((teacher) => teacher._id))].map(
                (_id) => finalTeachers.find((teacher) => teacher._id === _id)
              );
            return res.status(200).send(uniqueTeachers)
        }else{
            return res.status(404).send({
                error : "SectionNotFound",
            })
        }
    }catch(e){
        console.log(e)
        return res.status(500).send({
            error : "Server Error"
        })
    }
}


exports.getAvailableGroups = async (req, res) => {
    try {
        var { section, startsAt, duration, collegeYear, day } = req.params
        startsAt = startsAt ? Number(startsAt) : null
        duration = duration ? Number(duration) : null
        const endsAt = startsAt + duration
        console.log(startsAt, " ", endsAt)
        var groups = await GroupModel.find({ section, collegeYear })
        var templates = await Template.find({ group: { $in: groups.map((element) => element._id) } }).populate("sessions")
        templates = templates.filter((element) => element.sessions)
        var sessions = []
        templates.forEach((element) => {
            sessions = [...sessions, ...element.sessions]
        })
        const unavaiblableGroups = sessions.filter((element) => (day == element.day) && ((Number(element.startsAt) >= startsAt && Number(element.startsAt) < endsAt) || (Number(element.endsAt) <= endsAt && Number(element.endsAt) > startsAt) || (Number(element.startsAt) <= startsAt && Number(element.endsAt) >= endsAt))).map((element) => element.group.toString())
        groups = groups ? groups.filter((element) => unavaiblableGroups.indexOf(element._id.toString()) === -1) : []
        console.log(unavaiblableGroups)
        return res.status(200).json(groups)
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}