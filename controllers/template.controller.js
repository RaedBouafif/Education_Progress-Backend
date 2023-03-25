const Template = require("../models/template.model")
const Session = require("../models/session.model")
const section = require("../models/collegeYear.model")
const Semester = require("../models/semester.model")
const { Types } = require("mongoose")
const PlanningModel = require("../models/Planning.model")


exports.create = async (req,res) => {
    const { gorup , collegeYear, active } = req.body
    if (!gorup || !collegeYear) {
        return res.status(400).send({
            error : "BadRequest"
        })
    }
    try{
        const template = await Template.create({
            group : group,
            collegeYear : collegeYear,
            active : active || null
        })
        await template.save()
        return (template) ?
            res.status(201).send(template)
            :
            res.status(204).send({
                created: false
            })
    }catch(e){
        if (e.code === 11000){
            return res.status(409).send({
                error : "conflictTemplate"
            })
        }
        return res.status(500).send({
            error : "BadRequest"
        })
    }
}

exports.addSessionToTemplate = async (req,res) => {
    try{
        const { teacher, classroom, subject, group, day, startsAt, endsAt, sessionType, createdBy, modifiedBy, idTemplate } = req.body
        if (!teacher || !classroom || !subject || !group || !day || !startsAt || !endsAt || !sessionType || !createdBy || !modifiedBy || !idTemplate){
            return res.status(400).send({
                error : "BadRequest"
            })
        }
        const session = await Session.create({
            teacher : teacher,
            classroom : classroom,
            subject : subject,
            group : group,
            day : day,
            startsAt : startsAt,
            endsAt : endsAt,
            sessionType :sessionType,
            createdBy : createdBy,
            modifiedBy : modifiedBy,
        })
        await session.save()
        if (session){
            const updatedPlanning = await Template.findByIdAndUpdate(idTemplate, { $push: { sessions: session._id } }, {new : true, runValidators : true})
            .populate("collegeYear")
            .populate("sessions")
            .populate("group")
            if (updatedPlanning){
                return res.status(200).send({
                    updatedPlanning
                })
            }else{
                return res.status(400).send({
                    error: "TemplateError",
                    updated : false
                })
            }

        }else{
            return res.status(400).send({
                error :"SessionError",
                created: false
            })
        }
    }catch(e) {
        return res.status(500).send({
            error: "Server Error"
        })
    }
}

exports.getTemplatesByGroupAndCollegeYear = async (req,res) => {
    const { group, collegeYear } = req.query
    if (!group || !collegeYear){
        return res.status(400).send({
            error : "BadRequest"
        })
    }
    try{
        const templates = await Template.find({group : group, collegeYear : collegeYear}).sort({ createdAt: -1 })
        .populate("sessions")
        .populate("collegeYear")
        .populate("group")
        if (templates){
            return res.status(200).send({
                templates
            })
        }else{
            return res.status(404).send({
                found : false
            })
        }
    }catch(e){
        return res.status(500).send({
            return : "Server Error"
        })
    }
}

exports.getTemplatesByGroup = async (req,res) => {
    const { group, collegeYear } = req.query
    if (!group || !collegeYear){
        return res.status(400).send({
            error : "BadRequest"
        })
    }
    try{
        const templates = await Template.find({group : group}).sort({ createdAt: -1 })
        .populate("sessions")
        .populate("collegeYear")
        .populate("group")
        if (templates){
            return res.status(200).send({
                templates
            })
        }else{
            return res.status(404).send({
                found : false
            })
        }
    }catch(e){
        return res.status(500).send({
            return : "Server Error"
        })
    }
}