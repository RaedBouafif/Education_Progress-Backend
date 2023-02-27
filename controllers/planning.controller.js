const Planning = require("../models/Planning.model")
const Session = require("../models/session.model")
const section = require("../models/section.model")
const Semester = require("../models/semester.model")
const { Types } = require("mongoose")


exports.createInitialTemplate = async (req, res) => {
    //test if modified or not 
    try {
        //Initialize my Template and create an Initial Planning
        //sessions group semester default week = 1
        // var selectedSessions = []
        // for (var session of req.body.sessions) {
        //     const existedSession = await Session.find(
        //         {
        //             teacher: session.teacher,
        //             classroom: session.classroom,
        //             group: req.body.group,
        //             day: session.day,
        //             startsAt: session.startsAt,
        //             subject: session.subject,
        //             sessionType: session.sessionType,
        //             createdBy: session.createdBy
        //         }
        //     )
        //     if (!existedSession.length) { selectedSessions.push(session) }
        // }
        const sessionTemplate = await Session.create(req.body.sessions)
        for (s of sessionTemplate) {
            await s.save()
        }
        // const tempSessions = await Session.getDistinctLatestSessionTemplate(req.body.group, "template")
        const sessionsIds = sessionTemplate.map((element) => element._id)
        const planning = await Planning.create({ ...req.body, sessions: sessionsIds, week: 1 })
        await planning.save()
        return res.status(201).json(planning)
    } catch (e) {
        console.log(e)
        if (e.errors) {
            return res.status(400).send({
                error: "badRequest"
            })
        }
        return res.status(500).send({
            error: e.message,
            message: "Server ERROR!"
        })
    }
}


exports.getTemplate = async (req, res) => {
    try {
        var tempSessions = await Session.getDistinctLatestSessionTemplate(req.params.groupId, "template")
        if (tempSessions.length !== 0) return res.status(200).json({ tempSessions, found: true })
        else return res.status(204).json({ found: false })
    } catch (e) {
        console.log(e)
        if (e.errors) {
            return res.status(400).json({//need test
                error: "badRequest"
            })
        }
        return res.status(500).send({
            error: e.message,
            message: "Server ERROR!"
        })
    }
}



// exports.createOneSession = async (req, res) => {
//     try {
//         const sessionTemplate = await Session.create(req.body.sessions)
//         for (s of sessionTemplate) {
//             await s.save()
//         }
//         return res.status(201).json(sessionTemplate)
//     } catch (e) {
//         return res.status(500).send({
//             error: e.message,
//             message: "Server ERROR!"
//         })
//     }
// }

// create sessions manual => (if : séance déja fait ) ncreati planning 

//------------------------------------------------------------Plannning--------------------------------------------------------------

// Refresh planning
exports.refreshPlanning = async (req, res) => {
    //Valid for refreshing With creation of a new planning 
    //Valid for refreshing With an existing planning  (Still working...)
    // fel front ki bech naffichi el sessions mte3i ba3d marefreshit el planning bech nparkouri ken nel9a session manula fel wa9t nafsou m3a session template ====> n'affichi el manual
    try {
        const week = req.params.week
        const groupId = req.params.groupId
        const semesterId = req.params.semesterId
        const planning = await Planning.findOne({ group: groupId, week: Number(week) + 1, semesterId: semesterId })
        if (planning) {
            const planningPopulated = await planning.populate("sessions")
            console.log(planning)
            if (!planningPopulated.sessions.find( element => element.sessionCategorie === 'template')){
                var tempSessions = await Session.getDistinctLatestSessionTemplate(req.params.groupId, "template")
                const sessionsIds = tempSessions.map((element) => element._id)
                if (sessionsIds.length != 0) {
                    for (let tmpSession of sessionsIds) {
                        planning.sessions.push(tmpSession)
                    }
                }
                planning.save().then(data => {
                    return res.status(200).send({
                        data,
                        refreshed: true
                    })
                }).catch(err => {
                    return res.status(400).send({
                        error: err.message,
                        message: "Some ERROR  occured while refreshing the template"
                    })
                })
            }
            return res.status(200).send({
                planningPopulated,
                message : "Planning allready Refreshed!"
            })
        } else {
            console.log(req.params)
            const tmpOnes = await Session.aggregate([
                { $sort: { "createdAt": -1 } },
                { $match: { group: new Types.ObjectId(groupId) , sessionCategorie : "template"} },
                {
                    $group: {
                        _id: { day: "$day", startsAt: "$startsAt" },
                        doc: { $first: "$$ROOT" }
                    },
                },
                {
                    $replaceRoot: {
                        newRoot: "$doc"
                    }
                }
            ])
            const sessionsIds = tmpOnes.map((element) => element._id)
            console.log(sessionsIds)
            const nextWeek = Number(week) + 1
            const newPlanning = await Planning.create({
                group: groupId,
                semester: semesterId,
                sessions: sessionsIds,
                week: nextWeek
            })
            newPlanning.save().then(data => {
                return res.status(201).send({
                    data,
                    refreshed: true
                })
            }).catch(err => {
                return res.status(400).send({
                    error: err.message,
                    message: "Some error occured while refreshing the Planning"
                })
            })
        }
    } catch (e) {
        return res.status(500).send({
            error: e.message,
            message: "Server ERROR!"
        })
    }
}


// {
//     $match: {
//         week: Number(req.params.week),
//         group: Types.ObjectId(req.params.groupId),
//         semester: Types.ObjectId(req.params.semesterId)
//     }
// },
// {
//     $lookup: {
//         from: 'sessions', // Name of the referenced collection
//         localField: 'sessions',
//         foreignField: '_id',
//         as: 'sessionsData', // Field to store the populated data
//     }
// },
// { $unwind: '$sessionsData' },
// { $sort: { "sessionsData.createdAt": -1 } },
// {
//     $group: {
//         _id: { day: "$sessionsData.day", startsAt: "$sessionsData.startsAt" },
//         session: { $first: "$sessionsData" },
//     },
// },


// get planning By Group and week and semester
exports.getPlanning = async (req, res) => {
    // need aggregate to synchronise the modification
    try {
        // const planning = await Planning.aggregate(req.params.week, req.params.groupId, req.params.semesterId)
        const planning = await Planning.aggregate([
            {
                $match: {
                    week: Number(req.params.week),
                    group: Types.ObjectId(req.params.groupId),
                    semester: Types.ObjectId(req.params.semesterId)
                }
            },
            {
                $lookup: {
                    from: 'sessions', // Name of the referenced collection
                    localField: 'sessions',
                    foreignField: '_id',
                    as: 'sessionsData', // Field to store the populated data
                }
            },
            { $unwind: '$sessionsData' },
            { $sort: { "sessionsData.createdAt": -1 } },
            {
                $group: {
                    _id: { day: "$sessionsData.day", startsAt: "$sessionsData.startsAt" },
                    session: { $first: "$sessionsData" },
                },
            },
            {
                $replaceRoot: {
                    newRoot: "$session"
                }
            }
        ])
        if (!planning) {
            return res.status(404).send({
                message: "Planning of group " + req.params.groupId + " Not Found!",
                error: "NotFound",
                found: false
            })
        }
        return res.status(200).send({
            planning,
            found: true
        })
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: e.message,
            message: "Server ERROR!"
        })
    }
}



















exports.create = async (req, res) => {
    try {
        const planning = await Planning.create(req.body)
        await planning.save()
        return res.status(201).json(planning)
    } catch (e) {
        console.log(e)
        if (e.code === 11000) {
            return res.status(409).json({
                error: "conflictPlanning",
                message: "week , group and semester combination are already used"
            })
        }
        if (e.errors?.week?.properties) return res.status(400).json({
            error: e.errors.week.properties.message
        })
        else if (e.errors?.semester?.properties?.message === "semesterRequired")
            return res.status(400).json({
                error: "semesterRequired"
            })
        else if (e.errors?.dateBegin?.properties?.message === "dateBeginRequired")
            return res.status(400).json({
                error: "dateBeginRequired"
            })
        else if (e.errors?.dateEnd?.properties?.message === "dateEndRequired")
            return res.status(400).json({
                error: "dateEndRequired"
            })
        else if (e.errors?.group?.properties?.message === "groupRequired")
            return res.status(400).json({
                error: "groupRequired"
            })
        else if (e.errors)
            return res.status(400).json({
                error: "badRequest"
            })
        else
            return res.status(500).json({
                error: "serverSideError"
            })
        // if (e.errors?.week || e.errors?.dateBegin || e.errors?.dateEnd || e.errors?.group)
        //     return res.status(400).json({
        //         error: "badRequest"
        //     })
    }
}


exports.getAll = async (req, res) => {
    try {
        const plannings = await Planning.find(req.body)
            .populate("semester")
        // .populate({ path: "group", populate: { path: "section" } }) comments cause we find by groupe 
        return plannings.length
            ? res.status(200).json({ found: true, plannings })
            : res.status(204).json({ found: false })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            error: "serverSideError"
        })
    }
}



exports.getById = async (req, res) => {
    try {
        const { planningId } = req.params
        const planning = await Planning.findById(planningId)
        return planning
            ? res.status(200).json({ found: true, planning })
            : res.status(404).json({ found: false })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            error: "serverSideError"
        })
    }
}


exports.deleteById = async (req, res) => {//delete only manual sessions with the planning => en cas ou
    try {
        const { planningId } = req.params
        const planning = await Planning.findByIdAndRemove(planningId)
        return planning
            ? res.status(200).json({ found: true, planning })
            : res.status(404).json({ found: false })
    } catch (e) {
        return res.status(500).json({
            error: "serverSideError"
        })
    }
}




exports.update = async (req, res) => {
    try {
        const planning = await Planning.findByIdAndUpdate(req.params.planningId, req.body, {
            new: true,
            runValidators: true
        })
        return planning
            ? res.status(200).json({ planning, found: true })
            : res.status(404).json({ found: false })
    } catch (e) {
        console.log(e)
        if (e.code === 11000) {
            return res.status(409).json({
                error: "conflictPlanning",
                message: "week , group and semester combination are already used"
            })
        }
        else if (e.errors?.week?.properties) return res.status(400).json({
            error: e.errors.week.properties.message
        })
        else if (e.errors)
            return res.status(400).json({
                error: "badRequest"
            })
        else
            return res.status(500).json({
                error: "serverSideError"
            })
    }
}
