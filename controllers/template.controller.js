const Template = require("../models/template.model")
const Session = require("../models/session.model")
const section = require("../models/collegeYear.model")
const Semester = require("../models/semester.model")
const CollegeYearModel = require("../models/collegeYear.model")
const GroupModel = require("../models/group.model")
const SessionModel = require("../models/session.model")
const { Types } = require("mongoose")
const PlanningModel = require("../models/Planning.model")


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
        const { teacher, classroom, subject, group, day, startsAt, duree, sessionType, idTemplate, otherGroups } = req.body
        if (!teacher || !classroom || !subject || !group || (!day && day != 0) || !startsAt || !duree || !sessionType || !idTemplate) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        const session = await Session.create({
            teacher: teacher,
            classroom: classroom,
            subject: subject,
            group: group,
            day: day,
            startsAt: startsAt,
            endsAt: Number(startsAt) + Number(duree),
            sessionType: sessionType,
        })
        await session.save()
        if (otherGroups.length) {
            for (const element of otherGroups) {
                var otherSession = await Session.create({
                    teacher: teacher,
                    classroom: classroom,
                    subject: subject,
                    group: element,
                    day: day,
                    startsAt: startsAt,
                    endsAt: Number(startsAt) + Number(duree),
                    sessionType: sessionType,
                })
                await otherSession.save()
                if (otherSession) {
                    await Template.findOneAndUpdate({ group: element }, { $push: { sessions: otherSession._id } }, { new: true, runValidators: true })
                }
            }
        }
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
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}

//update session
exports.updateSessionFromTemplate = async (req, res) => {
    try {
        const { sessionId, templateId, teacher, subject, classroom, sessionType, duree, startsAt } = req.body
        if (!sessionId || !templateId) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        const session = await Session.findById(sessionId)
        if (session) {
            if (session.endsAt != Number(duree) + Number(startsAt) || session.startsAt != startsAt || session.teacher != teacher || session.subject != subject || session.classroom != classroom || session.sessionType != sessionType) {
                session.teacher = teacher
                session.subject = subject
                session.classroom = classroom
                session.sessionType = sessionType
                session.startsAt = startsAt
                session.endsAt = Number(duree) + Number(startsAt)
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
                template.sessions = template.sessions.filter((element) => element._id.toString() !== sessionId)
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