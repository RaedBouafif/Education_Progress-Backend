const Planning = require("../models/Planning.model")
const Session = require("../models/session.model")
const Section = require("../models/section.model")
const Semester = require("../models/semester.model")
const Student = require('../models/Users/student.model')
const CollegeYear = require("../models/collegeYear.model")
const Group = require("../models/group.model")
const Template = require("../models/template.model")
const Teacher = require("../models/Users/teacher.model")
const { Subject } = require("../models/subject.model")
const Classroom = require("../models/classroom.model")
const { Types } = require("mongoose")
const { notify } = require("../functions/Notify")
const { logData } = require("../functions/logging")



// création de planning
exports.create = async (req, res) => {
    try {
        const { group, collegeYear } = req.body
        if (!group || !collegeYear) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        const globalTemplate = await Template.findOne({ group: group, collegeYear: collegeYear }).populate({ path: "sessions" })
        if (globalTemplate) {
            const year = await CollegeYear.findById(collegeYear).populate({ path: "semesters", select: { dateBegin: 1, dateEnd: 1, name: 1 }, options: { sort: { dateBegin: 1 } } })
            if (year) {
                var numberTotalOfWeeks = 0
                var infos = []
                var returnedPlanning = null
                for (let i = 0; i < year.semesters.length; i++) {
                    var currentSemester = year.semesters[i]
                    let currentDateEnd = currentSemester.dateEnd
                    let currentDateBegin = currentSemester.dateBegin
                    let numberOfWeeks = Math.floor(Math.abs(currentDateEnd - currentDateBegin) / (1000 * 60 * 60 * 24 * 7))
                    infos.push({ semester: currentSemester.name, numberOfWeeks: numberOfWeeks, dateBegin: currentDateBegin, dateEnd: currentDateEnd })
                    numberTotalOfWeeks = numberTotalOfWeeks + numberOfWeeks
                }
                //this code will set our Dates depending on the smesters
                var number_Semesters_Trimesters = infos.length
                console.log(infos.length)
                switch (number_Semesters_Trimesters) {
                    case 1: {
                        var initialDatedebSem1 = infos[0].dateBegin
                        break
                    }
                    case 2: {
                        var initialDatedebSem1 = infos[0].dateBegin
                        var initialDatedebSem2 = infos[1].dateBegin
                        break
                    }
                    case 3: {
                        var initialDatedebSem1 = infos[0].dateBegin
                        var initialDatedebSem2 = infos[1].dateBegin
                        var initialDatedebSem3 = infos[2].dateBegin
                        break
                    }
                    default: return res.status(400).send({ error: "Planning cannot be created" })
                }
                //end of handling startingDates

                //this code will checks if i have to update the planning from the next week of the current one
                const currentDate = new Date()
                const currentPlanning = await Planning.findOne({ group: group, collegeYear: collegeYear, dateBegin: { $lte: currentDate }, dateEnd: { $gte: currentDate } })
                if (currentPlanning) {
                    // this code will update my planning starting from the current planning
                    var initialWeekToUpdate = currentPlanning.week + 1
                    for (initialWeekToUpdate; initialWeekToUpdate <= numberTotalOfWeeks; initialWeekToUpdate++) {
                        var newSessions = []
                        for (let x = 0; x < globalTemplate.sessions.length; x++) {
                            let currentSession = globalTemplate.sessions[x]
                            var newSession = await Session.create({
                                teacher: currentSession.teacher,
                                classroom: currentSession.classroom,
                                subject: currentSession.subject,
                                group: currentSession.group,
                                day: currentSession.day,
                                startsAt: currentSession.startsAt,
                                endsAt: currentSession.endsAt,
                                startedAt: currentSession.startedAt,
                                endedAt: currentSession.endedAt,
                                sessionType: currentSession.sessionType,
                                active: currentSession.active,
                                initialSubGroup: currentSession.initialSubGroup || "All",
                                sessionCategorie: "Template"
                            })
                            await newSession.save()
                            newSessions.push(newSession)
                        }
                        const filter = { week: initialWeekToUpdate, group: group, collegeYear: collegeYear }
                        var planning = await Planning.findOneAndUpdate(filter, { sessions: newSessions }, { new: true, runValidators: true })
                        console.log("planning updated")
                    }
                    if (initialWeekToUpdate === currentPlanning.week + 1) {
                        return res.status(204).send({
                            message: "The Update on the Planning cannot be performed because we are allready in the last week of the year"
                        })
                    }
                } else {
                    const existingPlanning = await Planning.findOne({ group: group, collegeYear: collegeYear, week: 1 })
                    if (existingPlanning) {
                        // this code will update the existing planning from week number 1 because this planning is in the future or from past
                        for (let w = 1; w <= numberTotalOfWeeks; w++) {
                            var newSessions = []
                            for (let x = 0; x < globalTemplate.sessions.length; x++) {
                                let currentSession = globalTemplate.sessions[x]
                                var newSession = await Session.create({
                                    teacher: currentSession.teacher,
                                    classroom: currentSession.classroom,
                                    subject: currentSession.subject,
                                    group: currentSession.group,
                                    day: currentSession.day,
                                    startsAt: currentSession.startsAt,
                                    endsAt: currentSession.endsAt,
                                    startedAt: currentSession.startedAt,
                                    endedAt: currentSession.endedAt,
                                    sessionType: currentSession.sessionType,
                                    active: currentSession.active,
                                    initialSubGroup: currentSession.initialSubGroup || "All",
                                    sessionCategorie: "Template"
                                })
                                await newSession.save()
                                newSessions.push(newSession)
                            }
                            const filter = { week: w, group: group, collegeYear: collegeYear }
                            var planning = await Planning.findOneAndUpdate(filter, { sessions: newSessions }, { new: true, runValidators: true })
                            console.log("planning updated")
                        }
                    } else {
                        // this code will create a new planning because it does not exist
                        console.log(initialDatedebSem1)
                        console.log(initialDatedebSem2)
                        console.log(initialDatedebSem3)
                        for (let j = 0; j < numberTotalOfWeeks; j++) {
                            var newSessions = []
                            for (let x = 0; x < globalTemplate.sessions.length; x++) {
                                let currentSession = globalTemplate.sessions[x]
                                var newSession = await Session.create({
                                    teacher: currentSession.teacher,
                                    classroom: currentSession.classroom,
                                    subject: currentSession.subject,
                                    group: currentSession.group,
                                    day: currentSession.day,
                                    startsAt: currentSession.startsAt,
                                    endsAt: currentSession.endsAt,
                                    startedAt: currentSession.startedAt,
                                    endedAt: currentSession.endedAt,
                                    sessionType: currentSession.sessionType,
                                    active: currentSession.active,
                                    initialSubGroup: currentSession.initialSubGroup || "All",
                                    sessionCategorie: "Template"
                                })
                                await newSession.save()
                                newSessions.push(newSession)
                            }
                            switch (number_Semesters_Trimesters) {
                                case 1: {
                                    const finalDate1 = new Date(initialDatedebSem1)
                                    finalDate1.setDate(finalDate1.getDate() + 6)
                                    if (j < infos[0].numberOfWeeks) {
                                        console.log("onlysem1")
                                        var planning = await Planning.create({
                                            week: j + 1,
                                            dateBegin: initialDatedebSem1,
                                            dateEnd: finalDate1,
                                            group: group,
                                            collegeYear: collegeYear,
                                            sessions: newSessions,
                                            active: true,
                                            weekType: "Default"
                                        })
                                        await planning.save()
                                        finalDate1.setDate(finalDate1.getDate() + 1)
                                        initialDatedebSem1 = finalDate1
                                    }
                                    break
                                }
                                case 2: {
                                    if (j < infos[0].numberOfWeeks) {
                                        console.log("sem1")
                                        const finalDate = new Date(initialDatedebSem1)
                                        finalDate.setDate(finalDate.getDate() + 6)
                                        var planning = await Planning.create({
                                            week: j + 1,
                                            dateBegin: initialDatedebSem1,
                                            dateEnd: finalDate,
                                            group: group,
                                            collegeYear: collegeYear,
                                            sessions: newSessions,
                                            active: true,
                                            weekType: "Default"
                                        })
                                        await planning.save()
                                        finalDate.setDate(finalDate.getDate() + 1)
                                        initialDatedebSem1 = finalDate
                                    } else {
                                        console.log("sem2")
                                        const finalDate = new Date(initialDatedebSem2)
                                        finalDate.setDate(finalDate.getDate() + 6)
                                        var planning = await Planning.create({
                                            week: j + 1,
                                            dateBegin: initialDatedebSem2,
                                            dateEnd: finalDate,
                                            group: group,
                                            collegeYear: collegeYear,
                                            sessions: newSessions,
                                            active: true,
                                            weekType: "Default"
                                        })
                                        await planning.save()
                                        finalDate.setDate(finalDate.getDate() + 1)
                                        initialDatedebSem2 = finalDate
                                    }
                                    break
                                }
                                case 3: {
                                    if (j < infos[0].numberOfWeeks) {
                                        console.log("sem3")
                                        const finalDate = new Date(initialDatedebSem1)
                                        finalDate.setDate(finalDate.getDate() + 6)
                                        var planning = await Planning.create({
                                            week: j + 1,
                                            dateBegin: initialDatedebSem1,
                                            dateEnd: finalDate,
                                            group: group,
                                            collegeYear: collegeYear,
                                            sessions: newSessions,
                                            active: true,
                                            weekType: "Default"
                                        })
                                        await planning.save()
                                        finalDate.setDate(finalDate.getDate() + 1)
                                        initialDatedebSem1 = finalDate
                                    } else if ((j < infos[0].numberOfWeeks + infos[1].numberOfWeeks) && (j >= infos[0].numberOfWeeks)) {
                                        console.log("sem3")
                                        const finalDate = new Date(initialDatedebSem2)
                                        finalDate.setDate(finalDate.getDate() + 6)
                                        var planning = await Planning.create({
                                            week: j + 1,
                                            dateBegin: initialDatedebSem2,
                                            dateEnd: finalDate,
                                            group: group,
                                            collegeYear: collegeYear,
                                            sessions: newSessions,
                                            active: true,
                                            weekType: "Default"
                                        })
                                        await planning.save()
                                        finalDate.setDate(finalDate.getDate() + 1)
                                        initialDatedebSem2 = finalDate
                                    }
                                    else {
                                        console.log("sem3")
                                        const finalDate = new Date(initialDatedebSem3)
                                        finalDate.setDate(finalDate.getDate() + 6)
                                        var planning = await Planning.create({
                                            week: j + 1,
                                            dateBegin: initialDatedebSem3,
                                            dateEnd: finalDate,
                                            group: group,
                                            collegeYear: collegeYear,
                                            sessions: newSessions,
                                            active: true,
                                            weekType: "Default"
                                        })
                                        await planning.save()
                                        finalDate.setDate(finalDate.getDate() + 1)
                                        initialDatedebSem3 = finalDate
                                    }
                                    break
                                }
                                default: return res.status(400).send({ error: "error occured while creating the planning" })
                            }
                            // if (planning.week == 1) {
                            //     returnedPlanning = await Planning.populate(planning, [
                            //         { path: "group", populate: { path: "section" } },
                            //         { path: "collegeYear" },
                            //         {
                            //             path: "sessions", populate: [
                            //                 { path: "teacher", select: { password: 0 } },
                            //                 { path: "subject", select: { image: 0 } },
                            //                 { path: "classroom" }
                            //             ]
                            //         }
                            //     ])
                            // }
                        }
                        if (returnedPlanning && infos.length) {
                            try {
                                logData({ modelId: planning._id, modelPath: "Planning", action: "Creating a new Planning: " + planning._id.toString() })
                            } catch (e) {
                                console.log(e.message)
                            }
                            return res.status(200).send({
                                cteated: true
                                // planning: returnedPlanning,
                                // initialSemester: year.semesters[0].name,
                                // numberTotalOfWeeks: numberTotalOfWeeks,
                                // infos
                            })
                        } else {
                            return res.status(400).send({
                                error: "Some Error occured"
                            })
                        }
                    }
                }
            } else {
                return res.status(404).send({
                    error: "CollegeYearNotFound"
                })
            }
        } else {
            return res.status(404).send({
                error: "PlanningNotFound"
            })
        }
    } catch (e) {
        console.log(e)
        if (e.code === 11000) {
            return res.status(409).send({
                error: "conflictPlanning"
            })
        }
        return res.status(500).send({
            error: "Server Error"
        })
    }
}
// exports.create = async (req,res) => {
//     try{
//         const { group, collegeYear, sessions } = req.body
//         if (!group || !collegeYear || !sessions){
//             return res.status(400).send({
//                 error : "BadRequest"
//             })
//         }
//         var planning = await Planning.create({
//             week: week,
//             group : group,
//             collegeYear : collegeYear,
//             sessions : sessions
//         })
//         planning = await planning.save()
//         planning = await Planning.populate(planning, [
//             { path : "group" , populate : {path : "section"}},
//             { path : "collegeYear" },
//             { path : "sessions" , populate : [
//                 {path : "teacher" , select : { password : 0}},
//                 {path : "subject" , select : { image : 0}},
//                 {path : "classroom"}
//             ]}
//         ])
//         console.log(planning)
//         if (!planning){
//             return res.status(204).send({
//                 error : "Some Error occured while creating the planning"
//             })
//         }else{
//             return res.status(201).send(planning)
//         }
//     }catch(e){
//         console.log(e)
//         if (e.code === 11000) {
//             return res.status(409).send({
//                 error: "conflictPlanning"
//             })
//         }
//         return res.status(500).send({
//             error : "Server Error"
//         })
//     }
// }


//get planning by week
exports.getPlanningByWeek = async (req, res) => {
    const collegeYear = req.params.collegeYear
    const group = req.params.group
    const week = req.params.week
    try {
        if (!week || !group || !collegeYear) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        const planning = Planning.findOne({ group: group, collegeYear: collegeYear, week: week }).sort({ createdAt: -1 })
            .populate({ path: "group", populate: [{ path: "section" }, { path: "students", select: { password: 0 } }] })
            .populate({ path: "collegeYear", populate: { path: "semesters" } })
            .populate({ path: "sessions", populate: [{ path: "examen"}, {path: "correcteur"}, {path: "event"}, { path: "teacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "group", populate: [[{ path: "students", select: { password: 0 } }, { path: "section" }], { path: "section" }] }, { path: "subTeacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "subject", populate: { path: "responsibleTeacher" }, }, { path: "classroom" }] })
        if (!planning) {
            return res.status(404).send({
                message: "PlannigNotFound"
            })
        }
        return res.status(200).send(planning)
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}

//get planning by next week
exports.getPlanningByNextWeek = async (req, res) => {
    const collegeYear = req.params.collegeYear
    const group = req.params.group
    const week = req.params.week
    const nbrNextWeek = req.query.nbrNextWeek ? Number(req.query.nbrNextWeek) : 1
    try {
        if (!week || !group || !collegeYear) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        const planning = await Planning.findOne({ group: group, collegeYear: collegeYear, week: Number(week) + nbrNextWeek }).sort({ createdAt: -1 })
            .populate({ path: "group", populate: [{ path: "section" }, { path: "students", select: { password: 0 } }] })
            .populate({ path: "collegeYear", populate: { path: "semesters" } })
            .populate({ path: "sessions", populate: [{ path: "examen"}, {path: "correcteur"}, {path: "event"}, { path: "teacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "group", populate: [[{ path: "students", select: { password: 0 } }, { path: "section" }], { path: "section" }] }, { path: "subTeacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "subject", populate: { path: "responsibleTeacher" }, }, { path: "classroom" }] })
        if (!planning) {
            return res.status(404).send({
                message: "PlannigNotFound"
            })
        }
        return res.status(200).send(planning)
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}

exports.getPlanningWithWeek = async (req, res) => {
    const collegeYear = req.params.collegeYear
    const group = req.params.group
    const week = req.params.week
    try {
        if (!week || !group || !collegeYear) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        const planning = await Planning.findOne({ group: group, collegeYear: collegeYear, week: Number(week) }).sort({ createdAt: -1 })
            .populate({ path: "group", populate: [{ path: "section" }, { path: "students", select: { password: 0 } }] })
            .populate("collegeYear")
            .populate({ path: "sessions", populate: [{ path: "examen"}, {path: "correcteur"}, {path: "event"}, { path: "teacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "group", populate: [[{ path: "students", select: { password: 0 } }, { path: "section" }], { path: "section" }] }, { path: "subTeacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "subject", populate: { path: "responsibleTeacher" }, }, { path: "classroom" }] })
        if (!planning) {
            return res.status(404).send({
                message: "PlannigNotFound"
            })
        }
        return res.status(200).send(planning)
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}

//get Planning by pred week
exports.getPlanningByPredWeek = async (req, res) => {
    const collegeYear = req.params.collegeYear
    const group = req.params.group
    const week = req.params.week
    const nbrPredWeek = req.query.nbrPredWeek ? Number(req.query.nbrPredWeek) : 1
    try {
        if (!week || !group || !collegeYear) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        const planning = await Planning.findOne({ group: group, collegeYear: collegeYear, week: Number(week) - nbrPredWeek }).sort({ createdAt: -1 })
            .populate({ path: "group", populate: [{ path: "section" }, { path: "students", select: { password: 0 } }] })
            .populate({ path: "collegeYear", populate: { path: "semesters" } })
            .populate({ path: "sessions", populate: [{ path: "examen"}, {path: "correcteur"}, {path: "event"}, { path: "teacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "group", populate: [{ path: "students", select: { password: 0 } }, { path: "section" }] }, { path: "subTeacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "subject", populate: { path: "responsibleTeacher" }, }, { path: "classroom" }] })
        if (!planning) {
            return res.status(404).send({
                message: "PlannigNotFound"
            })
        }
        return res.status(200).send(planning)
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}

//get current Planning this returns also the information of weeks
exports.getCurrentPlanning = async (req, res) => {
    const collegeYear = req.params.collegeYear
    const group = req.params.group
    // need to send the date of today and return the week equals to our current day
    try {
        if (!group || !collegeYear) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        console.log("hedhaaa")
        const year = await CollegeYear.findById(collegeYear).populate({ path: "semesters", select: { dateBegin: 1, dateEnd: 1, name: 1 }, options: { sort: { dateBegin: 1 } } })
        if (year) {
            var numberTotalOfWeeks = 0
            var infos = []
            for (let i = 0; i < year.semesters.length; i++) {
                var currentSemester = year.semesters[i]
                let currentDateEnd = currentSemester.dateEnd
                let currentDateBegin = currentSemester.dateBegin
                let numberOfWeeks = Math.floor(Math.abs(currentDateEnd - currentDateBegin) / (1000 * 60 * 60 * 24 * 7))
                infos.push({ semester: currentSemester.name, numberOfWeeks: numberOfWeeks, dateBegin: currentDateBegin, dateEnd: currentDateEnd, _id: currentSemester._id })
                numberTotalOfWeeks = numberTotalOfWeeks + numberOfWeeks
            }
            // this will always return week number 1 
            const currentDate = new Date()
            const currentPlanning = await Planning.findOne({ group: group, collegeYear: collegeYear, dateBegin: { $lte: currentDate }, dateEnd: { $gte: currentDate } })
                .populate({ path: "group", populate: [{ path: "section" }, { path: "students", select: { password: 0 } }] })
                .populate({ path: "collegeYear", populate: { path: "semesters" } })
                .populate({ path: "sessions", populate: [{ path: "examen"}, {path: "correcteur"}, {path: "event"}, { path: "teacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "group", populate: [{ path: "students", select: { password: 0 } }, { path: "section" }] }, { path: "subTeacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "subject", populate: { path: "responsibleTeacher" }, }, { path: "classroom" }] })
            if (!currentPlanning) {
                const initialPlanning = await Planning.findOne({ group: group, collegeYear: collegeYear, week: 1 }).sort({ createdAt: -1 })
                    .populate({ path: "group", populate: [{ path: "section" }, { path: "students", select: { password: 0 } }] })
                    .populate({ path: "collegeYear", populate: { path: "semesters" } })
                    .populate({ path: "sessions", populate: [{ path: "examen"}, {path: "correcteur"}, {path: "event"}, { path: "teacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "group", populate: [{ path: "students", select: { password: 0 } }, { path: "section" }] }, { path: "subTeacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "subject", populate: { path: "responsibleTeacher" }, }, { path: "classroom" }] })
                if (!initialPlanning) {
                    return res.status(404).json({
                        message: "PlannigNotFound"
                    })
                }
                return res.status(200).json({
                    planning: initialPlanning,
                    initialSemester: year.semesters[0].name,
                    numberTotalOfWeeks: numberTotalOfWeeks,
                    infos
                })
            } else {
                return res.status(200).send({
                    planning: currentPlanning,
                    initialSemester: year.semesters[0].name,
                    numberTotalOfWeeks: numberTotalOfWeeks,
                    infos
                })
            }
        } else {
            return res.status(404).json({
                error: "College Year with id : " + collegeYear + "NotFound"
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}


const transformDay = (day) => {
    switch (day) {
        case 1:
            return "Lun"
        case 2:
            return "Mar"
        case 3:
            return "Mer"
        case 4:
            return "Jeu"
        case 5:
            return "Ven"
        case 6:
            return "Sam"
        case 0:
            return "Dim"
    }
}


const transformToTime = (minutes) => {
    var firstPart = Math.floor(minutes / 60) < 10 ? "0" + Math.floor(minutes / 60) : Math.floor(minutes / 60)
    var secondPart = minutes % 60 < 10 ? "0" + (minutes % 60) : (minutes % 60)
    return firstPart + ":" + secondPart
}

// add session to Planning
exports.addSessionToPlanning = async (req, res) => {
    console.log(req.body)
    try {
        const { teacher, classroom, subject, group, day, startsAt, duree, sessionType, WeeksDuration, initialSubGroup, otherGroups, idPlanning, createdBy, collegeYear, catched } = req.body
        if (!teacher || !classroom || !subject || !group || (!day && day != 0) || !startsAt || !duree || !sessionType || !idPlanning) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        var notificationData = {}
        //notificationType : "newSession" , receiver : groups + other groups + teacher , message : (prof : --- \n salle : --- \n matiere : --- \n groupes : section + groupName \n week(week) day startsAtH - endsAtH ), , object : séance ajouté à votre emploi de temps
        var otherGroupsData = []
        if (otherGroups?.length) {
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
                    initialSubGroup: initialSubGroup || "All",
                    sessionCategorie: "Planning"
                })
                await otherSession.save()
                if (otherSession) {
                    var result = await Planning.findOneAndUpdate({ group: element }, { $push: { sessions: otherSession._id } }, { new: true, runValidators: true })
                        .populate({ path: "group", populate: { path: "section" } })
                    otherGroupsData.push(result.group)
                }
            }
        }
        var session = await Session.create({
            teacher: teacher,
            classroom: classroom,
            subject: subject,
            group: group,
            day: day,
            startsAt: startsAt,
            endsAt: startsAt + duree,
            sessionType: sessionType,
            duration: WeeksDuration || 1,
            initialSubGroup: initialSubGroup || "All",
            createdBy: createdBy || null,
            sessionCategorie: "Planning",
            catched
        })
        await session.save()
        if (session) {
            if (catched) {
                await Session.findByIdAndUpdate(catched, { catchedBy: session._id, treated: true }, { runValidators: true, new: true })
                //catchup notification 
                notificationData = { ...notificationData, notificationType: "catchupSession", object: "Séance de rattrapage ajouté à votre emploi de temps" }
            }
            else {
                //new session notification 
                notificationData = { ...notificationData, notificationType: "newSession", object: "Séance ajouté à votre emploi de temps", }
            }
            const updatedPlanning = await Planning.findByIdAndUpdate(idPlanning, { $push: { sessions: session._id } }, { new: true, runValidators: true })
                .populate("collegeYear")
                .populate({ path: "sessions", populate: [{ path: "examen"}, {path: "correcteur"}, {path: "event"}, { path: "teacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "group", populate: [{ path: "students", select: { password: 0 } }, { path: "section" }] }, { path: "subTeacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "subject", populate: { path: "responsibleTeacher" }, }, { path: "classroom" }] })
                .populate({ path: "group", populate: { path: "section" } })
            if (updatedPlanning) {
                const findedSession = updatedPlanning?.sessions.find((element) => element._id.toString() == session._id.toString())
                const findedTeacher = findedSession?.teacher
                const teacherName = findedTeacher ? findedTeacher.firstName + " " + findedTeacher.lastName : ""
                try {
                    var margeDate = new Date(updatedPlanning.dateBegin)
                    var realDay = findedSession.day === 0 ? 7 : findedSession.day
                    margeDate.setDate(margeDate.getDate() + realDay - 1)
                    var myYear = margeDate.getFullYear()
                    var myMonth = String(margeDate.getMonth() + 1).padStart(2, '0');
                    var myDay = String(margeDate.getDate()).padStart(2, '0');
                    const finalDate = `${myYear}/${myMonth}/${myDay}`
                    notificationData = {
                        ...notificationData,
                        receivers: [{ receiverId: new Types.ObjectId(teacher), type: "Teacher" }, ...updatedPlanning.group.students?.map((element) => ({ receiverId: new Types.ObjectId(element), type: "Student" })), ...otherGroupsData.map((element) => element.students ? element.students : []).flatMap((element) => element).map((element) => ({ receiverId: new Types.ObjectId(element), type: "Student" }))],
                        content: `Prof : ${teacherName} \n Salle : ${findedSession?.classroom?.classroomName} \n Matiere : ${findedSession?.subject?.subjectName} \n Type séance : ${findedSession.sessionType} \n Groupes : ${[...otherGroupsData.map((element) => element?.section?.sectionName + " " + element.groupName), updatedPlanning.group?.section?.sectionName + " " + updatedPlanning.group?.groupName].join(" - ")} \n Date de séance : ${finalDate} \n Durée de séance : ${transformToTime(findedSession?.startsAt)}H - ${transformToTime(findedSession?.endsAt)}H`,
                        session: new Types.ObjectId(session._id)
                    }
                    notify(notificationData)
                } catch (e) {
                    console.log(e)
                    console.log("in call")
                }
                var newPlannings = [updatedPlanning]
                if (WeeksDuration > 1 && collegeYear) {
                    for (let i = 0; i < WeeksDuration - 1; i++) {
                        var session2 = await Session.create({
                            teacher: teacher,
                            classroom: classroom,
                            subject: subject,
                            group: group,
                            day: day,
                            startsAt: startsAt,
                            endsAt: startsAt + duree,
                            sessionType: sessionType,
                            duration: WeeksDuration || 1,
                            initialSubGroup: initialSubGroup || "All",
                            createdBy: createdBy || null,
                            sessionCategorie: "Planning"
                        })
                        await session2.save()
                        const updatedPlanning1 = await Planning.findOneAndUpdate({ collegeYear: collegeYear, group: group, week: updatedPlanning.week + i + 1 }, { $push: { sessions: session2._id } }, { new: true, runValidators: true })
                            .populate("collegeYear")
                            .populate({ path: "sessions", populate: [{ path: "examen"}, {path: "correcteur"}, {path: "event"}, { path: "teacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "group", populate: [{ path: "students", select: { password: 0 } }, { path: "section" }] }, { path: "subTeacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "subject", populate: { path: "responsibleTeacher" }, }, { path: "classroom" }] })
                            .populate("group")
                        if (!updatedPlanning1) {
                            return res.status(400).send({
                                error: "Error occured while updating the next plannings with adding this session"
                            })
                        }
                        else {
                            newPlannings.push(updatedPlanning1)
                        }
                    }
                }
                try {
                    logData({ modelId: Types.ObjectId(idPlanning), modelPath: "Planning", secondModelId: session._id, secondModelPath: "Session", action: "Creating a new Session: " + session._id.toString() + " to planning: " + idPlanning })
                } catch (e) {
                    console.log(e.message)
                }
                return res.status(200).send(newPlannings)
            } else {
                return res.status(404).send({
                    error: "Planning with id : " + idPlanning + " Not Found"
                })
            }
        }
    } catch (e) {
        console.log(e)
        // need to check the exceptions for example 
        return res.status(500).send({
            error: "Server Error"
        })
    }
}

//Update Session from Planning
// group week duration => plannings 
exports.updateSessionFromPlanning = async (req, res) => {
    try {
        console.log("-- update planning --")
        const { group, oldClassroom, oldStartsAt, oldDay, oldEndsAt, oldSubject, oldTeacher, week, collegeYear, teacher, subject, classroom, startsAt, endsAt, sessionType, initialSubGroup, WeeksDuration } = req.body
        if (!group || !week) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        if (!initialSubGroup) {
            initialSubGroup = "All"
        }
        var notificationData = {}
        notificationData = { ...notificationData, notificationType: "updateSession", object: "une Séance a été modifiée dans votre emploi de temps", }

        const plannings = await Planning.find({ group, collegeYear, week: { $gte: week, $lt: (Number(week) + Number(WeeksDuration)) } })
            .populate({ path: "sessions", match: { day: oldDay, startsAt: oldStartsAt, endsAt: oldEndsAt, classroom: oldClassroom, subject: oldSubject, $or: [{ teacher: oldTeacher }, { subTeacher: oldTeacher }] } })
        console.log("length : " + plannings.length)
        var sessions = []
        for (var pl of plannings) {
            sessions = [...sessions, ...pl?.sessions]
        }
        for (let session of sessions) {
            session = await Session.findById(session._id)
            if (session.teacher == teacher) {
                session.subTeacher = null
                if (startsAt != session.startsAt || session.endsAt != endsAt || session.subject != subject || session.classroom != classroom || session.sessionType != sessionType || session.initialSubGroup != initialSubGroup) {
                    session.subject = subject
                    session.classroom = classroom
                    session.sessionType = sessionType
                    session.initialSubGroup = initialSubGroup
                    session.startsAt = startsAt
                    session.endsAt = endsAt
                    session.sessionCategorie = "Planning"
                    session.treated = true
                }
                await session.save()
            }
            else {
                if (session.subTeacher != teacher || startsAt != session.startsAt || session.endsAt != endsAt || session.subject != subject || session.classroom != classroom || session.sessionType != sessionType || session.initialSubGroup != initialSubGroup) {
                    session.subTeacher = teacher
                    session.subject = subject
                    session.classroom = classroom
                    session.sessionType = sessionType
                    session.initialSubGroup = initialSubGroup
                    session.startsAt = startsAt
                    session.endsAt = endsAt
                    session.sessionCategorie = "Planning"
                    session.treated = true
                    await session.save()
                }
            }
            console.log(session.subTeacher)
        }
        const newPlannings = await Planning.find({ group, week: { $gte: week, $lt: (Number(week) + Number(WeeksDuration)) } })
            .populate("collegeYear")
            .populate({ path: "sessions", populate: [{ path: "examen"}, {path: "correcteur"}, {path: "event"}, { path: "teacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "group", populate: [{ path: "students", select: { password: 0 } }, { path: "section" }] }, { path: "subTeacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "subject", populate: { path: "responsibleTeacher" }, }, { path: "classroom" }] })
            .populate("group")
        try {
            const findedPlanning = newPlannings.find((element) => element.sessions?.find((element2) => element2._id.toString() === sessions[0]._id.toString()))
            console.log(findedPlanning)
            const findedSession = findedPlanning.sessions?.find((element) => element._id.toString() === sessions[0]._id.toString())
            var margeDate = new Date()
            var realDay = findedSession.day === 0 ? 7 : findedSession.day
            margeDate.setDate(margeDate.getDate() + realDay - 1)
            var myYear = margeDate.getFullYear()
            var myMonth = String(margeDate.getMonth() + 1).padStart(2, '0');
            var myDay = String(margeDate.getDate()).padStart(2, '0');
            const finalDate = `${myYear}/${myMonth}/${myDay}`
            if (findedSession.subTeacher) {
                notificationData = {
                    session: new Types.ObjectId(findedSession._id),
                    object: 'Une séance a été modifiée dans votre emploi du temps',
                    receivers: [{ receiverId: new Types.ObjectId(findedSession.teacher._id), receiverPath: "Teacher" }, { receiverId: new Types.ObjectId(findedSession.subTeacher._id), receiverPath: "Teacher" }, ...findedPlanning.group.students?.map((element) => ({ receiverId: new Types.ObjectId(element), receiverPath: "Student" }))],
                    content: `Prof : ${findedSession.subTeacher.firstName + " " + findedSession.subTeacher.lastName} \n Salle : ${findedSession?.classroom?.classroomName} \n Matiere : ${findedSession?.subject?.subjectName} \n Type séance : ${findedSession.sessionType} \n Date de séance : ${finalDate} \n Durée de séance : ${transformToTime(findedSession?.startsAt)}H - ${transformToTime(findedSession?.endsAt)}H`,
                }
            } else
                notificationData = {
                    session: new Types.ObjectId(findedSession._id),
                    object: 'Une séance a été modifiée dans votre emploi du temps',
                    receivers: [{ receiverId: new Types.ObjectId(findedSession.teacher._id), receiverPath: "Teacher" }, ...findedPlanning.group.students?.map((element) => ({ receiverId: new Types.ObjectId(element), receiverPath: "Student" }))],
                    content: `Prof : ${findedSession.teacher.firstName + " " + findedSession.teacher.lastName} \n Salle : ${findedSession?.classroom?.classroomName} \n Matiere : ${findedSession?.subject?.subjectName} \n Type séance : ${findedSession.sessionType} \n Date de séance : ${finalDate} \n Durée de séance : ${transformToTime(findedSession?.startsAt)}H - ${transformToTime(findedSession?.endsAt)}H`,
                }
            notify(notificationData)

        } catch (e) {
            console.log(e)
            console.log("error in modification")
        }
        try {
            logData({ modelId: findedPlanning._id, modelPath: "Planning", secondModelId: findedSession._id, secondModelPath: "Session", action: "Updating a session: " + findedPlanning._id.toString() + " from Planning: " + findedSession._id.toString() })
        } catch (e) {
            console.log(e.message)
        }
        return res.status(200).json(newPlannings)
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}

//Delete Session from Planning
exports.deleteSessionFromPlanning = async (req, res) => {
    try {
        const { sessionId, planningId } = req.params
        if (!planningId || !sessionId) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        var planning = await Planning.findById(planningId)
        if (planning) {
            console.log(planning?.sessions)
            if (planning?.sessions?.find((element) => element._id.toString() === sessionId)) {
                planning.sessions = planning.sessions.filter((element) => element.toString() !== sessionId)
                await planning.save()
                const deletedSession = await Session.findByIdAndDelete(sessionId)
                console.log(deletedSession)
                if (deletedSession?.catched) {
                    await Session.findByIdAndUpdate(deletedSession.catched, { catchedBy: null })
                }
                try {
                    logData({ modelId: planning._id, modelPath: "Planning", secondModelId: Types.ObjectId(sessionId), secondModelPath: "Session", action: "Deleting a session: " + sessionId + " from Planning: " + planning._id.toString() })
                } catch (e) {
                    console.log(e.message)
                }
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
                error: "planningNotFound"
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            error: "serverSideError"
        })
    }
}

// switch session with another one 
exports.switchSessionsFromPlanning = async (req, res) => {
    try {
        const { initialPlanning, intialSessionId, otherPlanning, otherSessionId } = req.body
        if (!initialPlanning || !intialSessionId || !otherPlanning || !otherSessionId) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        const newInitialPlanning = await Planning.findByIdAndUpdate(initialPlanning, { $pull: { sessions: Types.ObjectId(intialSessionId) }, $push: { sessions: Types.ObjectId(otherSessionId) } }, { new: true })
            .populate("collegeYear")
            .populate({ path: "sessions", populate: [{ path: "examen"}, {path: "correcteur"}, {path: "event"}, { path: "teacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "group", populate: [{ path: "students", select: { password: 0 } }, { path: "section" }] }, { path: "subTeacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "subject", populate: { path: "responsibleTeacher" }, }, { path: "classroom" }] })
            .populate("group")
        if (newInitialPlanning) {
            const newOtherPlanning = await Planning.findByIdAndUpdate(otherPlanning, { $pull: { sessions: Types.ObjectId(otherSessionId) }, $push: { sessions: Types.ObjectId(intialSessionId) } }, { new: true })
            if (!newOtherPlanning) {
                return res.status(400).send({
                    error: "Switching session error",
                    message: "the other Planning with id : " + otherPlanning + " Issue."
                })
            }
            try {
                logData({ modelId: newInitialPlanning._id, modelPath: "Planning", secondModelId: newOtherPlanning._id, secondModelPath: "Planning", action: "Switching session: " + Types.ObjectId(otherSessionId) + "from planning: " + newInitialPlanning._id.toString() + " to planning: " + newOtherPlanning._id.toString() })
            } catch (e) {
                console.log(e.message)
            }
            return res.status(200).send(newInitialPlanning)
        } else {
            return res.status(400).send({
                error: "Switching session error",
                message: "initial Planning with id : " + initialPlanning + " Issue."
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}

// find availble teachers
exports.findAvailableTeachers = async (req, res) => {
    try {
        const subjectId = req.params.subjectId
        const { startsAt, duree, day, collegeYear, week } = req.body
        if (!startsAt || !duree || (!day && day != 0) || !collegeYear || !subjectId || !week) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        var teachersOfTheSubject = await Subject.findById(subjectId, 'subjectName teachers').populate({ path: "teachers", select: { note: 0, birth: 0, maritalStatus: 0, password: 0 } })
        if (!teachersOfTheSubject) {
            return res.status(204).send({
                error: "EmptyDataBase",
                message: "There is no Teachers in Data base"
            })
        } else {
            teachersOfTheSubject = teachersOfTheSubject.teachers
            var OccupiedTeachers = await Planning.find({ collegeYear: collegeYear, week: week }, 'sessions')
                .populate({ path: "sessions", match: { startsAt: startsAt, day: day } })
            var OccupiedPredTeachers = await Planning.find({ collegeYear: collegeYear, week: week }, 'sessions')
                .populate({ path: "sessions", match: { startsAt: { $lt: startsAt }, day: day }, options: { sort: { startsAt: -1 } } })
            var OccupiedNextTeachers = await Planning.find({ collegeYear: collegeYear, week: week }, 'sessions')
                .populate({ path: 'sessions', match: { startsAt: { $gt: startsAt }, day: day }, options: { sort: { startsAt: 1 } } })
            OccupiedTeachers = OccupiedTeachers?.filter((element) => Array.isArray(element.sessions) && element.sessions.length).length ? OccupiedTeachers?.filter((element) => Array.isArray(element.sessions)) : []
            for (let i = 0; i < OccupiedPredTeachers.length; i++) {
                if (OccupiedPredTeachers[i].sessions?.length) {
                    if ((Number(OccupiedPredTeachers[i].sessions[0]?.endsAt) > Number(startsAt))) {
                        teachersOfTheSubject = teachersOfTheSubject.filter((element) => OccupiedPredTeachers[i]?.sessions[0]?.teacher.toString() != element._id.toString())
                    }
                }
            }
            for (let j = 0; j < OccupiedNextTeachers.length; j++) {
                if (OccupiedNextTeachers[j].sessions?.length) {
                    if ((Number(OccupiedNextTeachers[j]?.sessions[0]?.startsAt) < Number(startsAt) + Number(duree))) {
                        console.log("edszdqs")
                        teachersOfTheSubject = teachersOfTheSubject.filter((element) => OccupiedNextTeachers[j]?.sessions[0]?.teacher.toString() != element._id.toString())
                    }
                }
                // console.log(OccupiedNextTeachers[j]?.sessions[0]?.startsAt)
                // console.log(Number(startsAt) + Number(duree))

            }
            var newOccupiedTeachers = []
            if (OccupiedTeachers.length > 1) {
                let curr = 0
                for (let i = 0; i < OccupiedTeachers.length; i++) {
                    if (OccupiedTeachers[i].sessions?.length) {
                        newOccupiedTeachers[curr] = OccupiedTeachers[i].sessions[0].teacher.toString()
                        curr = curr + 1
                    }
                }
                // newOccupiedTeachers = OccupiedTeachers.reduce((a, b, index) => index !== 1 ? [...a, ...b.sessions] : [...a.sessions, b.sessions]).map((element) => element.teacher?.toString()) || []
            }
            else if (OccupiedTeachers.length === 1) {
                newOccupiedTeachers = OccupiedTeachers[0].sessions?.map((element) => element.teacher.toString()) || []
                //OccupiedTeachers = [OccupiedTeachers[0].teacher.toString()]// can generate error because i have correct her in avai-classroom(planning)
            }
            // console.log(teachersOfTheSubject)
            if (!newOccupiedTeachers.length) {
                return res.status(200).json(teachersOfTheSubject)
            } else {
                console.log(2232)
                return res.status(200).json(teachersOfTheSubject.filter((element) => newOccupiedTeachers.indexOf(element._id.toString()) === -1))
            }
        }
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}


//find available classrooms
exports.findAvailableClassroms = async (req, res) => {
    try {
        console.log(req.body)
        const { startsAt, duree, day, collegeYear, week } = req.body
        if (!startsAt || !duree || (!day && day != 0) || !collegeYear || !week) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        var classrooms = await Classroom.find({})
        if (!classrooms) {
            return res.status(400).send({
                error: "NoClassrooms"
            })
        }
        var OccupiedClassrooms = await Planning.find({ collegeYear: collegeYear, week: week }, 'sessions').populate({ path: 'sessions', match: { startsAt: startsAt, day: day, collegeYear: collegeYear } })
        var OccupiedPredClassrooms = await Planning.find({ collegeYear: collegeYear, week: week }, 'sessions').populate({ path: 'sessions', match: { startsAt: { $lt: startsAt }, day: day }, options: { sort: { startsAt: -1 } } })
        var OccupiedNextClassrooms = await Planning.find({ collegeYear: collegeYear, week: week }, 'sessions').populate({ path: 'sessions', match: { startsAt: { $gt: startsAt }, day: day } })
        OccupiedClassrooms = OccupiedClassrooms?.filter((element) => Array.isArray(element.sessions) && element.sessions.length).length ? OccupiedClassrooms?.filter((element) => Array.isArray(element.sessions)) : []
        for (let i = 0; i < OccupiedPredClassrooms.length; i++) {
            if (OccupiedPredClassrooms[i].sessions?.length) {
                if (Number(OccupiedPredClassrooms[i]?.sessions[0]?.endsAt) > Number(startsAt)) {
                    console.log(1)
                    classrooms = classrooms.filter((element) => OccupiedPredClassrooms[i]?.sessions[0]?.classroom != element._id?.toString())
                }
            }
        }
        for (let j = 0; j < OccupiedNextClassrooms.length; j++) {
            if (OccupiedNextClassrooms[j].sessions?.length) {
                if (Number(OccupiedNextClassrooms[j]?.sessions[0]?.startsAt) < Number(startsAt) + Number(duree)) {
                    classrooms = classrooms.filter((element) => OccupiedNextClassrooms[j]?.sessions[0]?.classroom != element._id?.toString())
                }
            }
        }
        var newOccupiedClassrooms = []
        if (OccupiedClassrooms.length > 1) {
            console.log("hedghioi")
            let x = 0
            for (let i = 0; i < OccupiedClassrooms.length; i++) {
                if (OccupiedClassrooms[i].sessions?.length) {
                    newOccupiedClassrooms[x] = OccupiedClassrooms[i]?.sessions[0]?.teacher?.toString()
                    console.log(newOccupiedClassrooms)
                    x = x + 1
                }
            }
            // newOccupiedTeachers = OccupiedTeachers.reduce((a, b, index) => index !== 1 ? [...a, ...b.sessions] : [...a.sessions, b.sessions]).map((element) => element.teacher?.toString()) || []
        }
        else if (OccupiedClassrooms.length === 1) {
            newOccupiedClassrooms = OccupiedClassrooms[0].sessions?.map((element) => element.teacher.toString()) || []
            //OccupiedTeachers = [OccupiedTeachers[0].teacher.toString()]// can generate error because i have correct her in avai-classroom(planning)
        }
        if (!newOccupiedClassrooms.length) {
            return res.status(200).json(classrooms)
        } else {
            return res.status(200).json(classrooms.filter((element) => newOccupiedClassrooms.indexOf(element._id.toString()) === -1))
        }
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}


//find available groups
exports.getAvailableGroups = async (req, res) => {
    try {
        var { section, startsAt, duration, collegeYear, day, week } = req.body
        startsAt = startsAt ? Number(startsAt) : null
        duration = duration ? Number(duration) : null
        const endsAt = startsAt + duration
        console.log(startsAt, " ", endsAt)
        var groups = await Group.find({ section, collegeYear })
        var plannings = await Planning.find({ group: { $in: groups.map((element) => element._id) }, week: week }).populate("sessions")
        plannings = plannings.filter((element) => element.sessions)
        var sessions = []
        plannings.forEach((element) => {
            sessions = [...sessions, ...element.sessions]
        })
        const unavaiblableGroups = sessions.filter((element) => (day == element.day) && ((Number(element.startsAt) >= startsAt && Number(element.startsAt) < endsAt) || (Number(element.endsAt) <= endsAt && Number(element.endsAt) > startsAt) || (Number(element.startsAt) <= startsAt && Number(element.endsAt) >= endsAt))).map((element) => element.group.toString())
        groups = groups ? groups.filter((group) => plannings.some((planning) => planning.group.toString() === group._id.toString())) : []
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










//function that checks if the classroom is available in the given week
const checkClassroomAvailability = async (startsAt, duree, day, collegeYear, week, classroom) => {
    try {
        // console.log(startsAt)
        // console.log(duree)
        // console.log(day)
        // console.log(collegeYear)
        // console.log(week)
        // console.log(classroom)
        var OccupiedClassrooms = await Planning.find({ collegeYear: collegeYear, week: week }, 'sessions').populate({ path: 'sessions', match: { startsAt: startsAt, day: day, collegeYear: collegeYear } })
        var OccupiedPredClassrooms = await Planning.find({ collegeYear: collegeYear, week: week }, 'sessions').populate({ path: 'sessions', match: { day: day, startsAt: { $lt: startsAt } }, options: { sort: { startsAt: -1 } } })
        var OccupiedNextClassrooms = await Planning.find({ collegeYear: collegeYear, week: week }, 'sessions').populate({ path: 'sessions', match: { day: day, startsAt: { $gt: startsAt } } })
        OccupiedClassrooms = OccupiedClassrooms?.filter((element) => Array.isArray(element.sessions) && element.sessions.length).length ? OccupiedClassrooms?.filter((element) => Array.isArray(element.sessions)) : []
        for (let i = 0; i < OccupiedPredClassrooms.length; i++) {
            if (OccupiedPredClassrooms[i].sessions?.length) {
                if ((Number(OccupiedPredClassrooms[i]?.sessions[0]?.endsAt) > Number(startsAt)) && (OccupiedPredClassrooms[i]?.sessions[0]?.classroom == classroom)) {
                    console.log(1)
                    return false
                }
            }
        }
        for (let j = 0; j < OccupiedNextClassrooms.length; j++) {
            if (OccupiedNextClassrooms[j].sessions?.length) {
                if ((Number(OccupiedNextClassrooms[j]?.sessions[0]?.startsAt) < Number(startsAt) + Number(duree)) && (OccupiedNextClassrooms[j]?.sessions[0]?.classroom == classroom)) {
                    console.log(2)
                    return false
                }
            }
        }
        var newOccupiedClassrooms = []
        if (OccupiedClassrooms.length > 1) {
            console.log("hedghioi")
            let x = 0
            for (let i = 0; i < OccupiedClassrooms.length; i++) {
                if (OccupiedClassrooms[i].sessions?.length) {
                    newOccupiedClassrooms[x] = OccupiedClassrooms[i].sessions[0].teacher.toString()
                    console.log(newOccupiedClassrooms)
                    x = x + 1
                }
            }
            // newOccupiedTeachers = OccupiedTeachers.reduce((a, b, index) => index !== 1 ? [...a, ...b.sessions] : [...a.sessions, b.sessions]).map((element) => element.teacher?.toString()) || []
        }
        else if (OccupiedClassrooms.length === 1) {
            newOccupiedClassrooms = OccupiedClassrooms[0].sessions?.map((element) => element.teacher.toString()) || []
            //OccupiedTeachers = [OccupiedTeachers[0].teacher.toString()]// can generate error because i have correct her in avai-classroom(planning)
        }
        if (!newOccupiedClassrooms.length) {
            return true
        } else if (newOccupiedClassrooms.indexOf(classroom) === -1) {
            return true
        } else {
            return false
        }
    } catch (e) {
        console.log(e)
    }
}


//function that checks if the teacher is available in the given week
const checkTeacherAvailability = async (startsAt, duree, day, collegeYear, week, teacher) => {
    try {
        var OccupiedTeachers = await Planning.find({ collegeYear: collegeYear, week: week }, 'sessions')
            .populate({ path: "sessions", match: { startsAt: startsAt, day: day } })
        var OccupiedPredTeachers = await Planning.find({ collegeYear: collegeYear, week: week }, 'sessions')
            .populate({ path: "sessions", match: { day: day, startsAt: { $lt: startsAt } }, options: { sort: { startsAt: -1 } } })
        var OccupiedNextTeachers = await Planning.find({ collegeYear: collegeYear, week: week }, 'sessions')
            .populate({ path: 'sessions', match: { day: day, startsAt: { $gt: startsAt } } })
        OccupiedTeachers = OccupiedTeachers?.filter((element) => Array.isArray(element.sessions) && element.sessions.length).length ? OccupiedTeachers?.filter((element) => Array.isArray(element.sessions)) : []
        for (let i = 0; i < OccupiedPredTeachers.length; i++) {
            if (OccupiedPredTeachers[i].sessions?.length) {
                if ((OccupiedPredTeachers[i].sessions.length) && (Number(OccupiedPredTeachers[i]?.sessions[0]?.endsAt) > Number(startsAt)) && (OccupiedPredTeachers[i]?.sessions[0]?.teacher == teacher)) {
                    return false
                }
            }
        }
        for (let j = 0; j < OccupiedNextTeachers.length; j++) {
            if (OccupiedNextTeachers[j].sessions?.length) {
                if ((OccupiedNextTeachers[j].sessions.length) && (Number(OccupiedNextTeachers[j]?.sessions[0]?.startsAt) < Number(startsAt) + Number(duree)) && (OccupiedNextTeachers[j]?.sessions[0]?.teacher == teacher)) {
                    return false
                }
            }
        }
        var newOccupiedTeachers = []
        if (OccupiedTeachers.length > 1) {
            console.log("hedghioi")
            let x = 0
            for (let i = 0; i < OccupiedTeachers.length; i++) {
                if (OccupiedTeachers[i].sessions?.length) {
                    newOccupiedTeachers[x] = OccupiedTeachers[i].sessions[0].teacher.toString()
                    console.log(newOccupiedTeachers)
                    x = x + 1
                }
            }
            // newOccupiedTeachers = OccupiedTeachers.reduce((a, b, index) => index !== 1 ? [...a, ...b.sessions] : [...a.sessions, b.sessions]).map((element) => element.teacher?.toString()) || []
        }
        else if (OccupiedTeachers.length === 1) {
            newOccupiedTeachers = OccupiedTeachers[0].sessions?.map((element) => element.teacher.toString()) || []
            //OccupiedTeachers = [OccupiedTeachers[0].teacher.toString()]// can generate error because i have correct her in avai-classroom(planning)
        }
        if (!newOccupiedTeachers.length) {
            return true
        } else if (newOccupiedTeachers.indexOf(teacher) === -1) {
            return true
        } else {
            return false
        }
    } catch (e) {
        console.log(e)
    }
}



//function that checks if the group given is available in the given week
const checkGroupAvailability = async (startsAt, duree, collegeYear, day, week, group) => {
    try {
        const planning = await Planning.findOne({ group: group, week: week, collegeYear: collegeYear }).populate({ path: "sessions", match: { day: day } })
        if (planning) {
            const session = planning?.sessions.find((element) => element.startsAt == Number(startsAt))
            if (session) {
                return false
            }
            const predSessions = planning?.sessions.filter((element) => element.startsAt < startsAt)
            if (predSessions) {
                const checkpredSession = predSessions.find((element) => element.endsAt > startsAt)
                if (checkpredSession) {
                    return false
                }
            }
            const nextSessions = planning?.sessions.filter((element) => element.startsAt > startsAt)
            if (nextSessions) {
                const checknextSession = nextSessions.find((element) => element.endsAt < startsAt + duree)
                if (checknextSession) {
                    return false
                }
            }
        } else {
            return true
        }
        return true
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}




//check availabity for the duration
exports.checkSessionDurationAvailability = async (req, res) => {
    try {
        var { groups, teacher, classroom, duration, week, collegeYear, group, startsAt, duree, day, sameTeacher, sameClassroom } = req.body
        if (!teacher || !classroom || !duration) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        sameTeacher = sameTeacher != undefined ? sameTeacher : false
        sameClassroom = sameClassroom != undefined ? sameClassroom : false
        for (var i = 1; i < Number(duration); i++) {
            const planning = await Planning.findOne({ collegeYear: collegeYear, group: group, week: week + i })
            if (planning) {
                if (groups?.length) {
                    for (let j = 0; j < groups.length; j++) {
                        let groupAvailability = await checkGroupAvailability(startsAt, duree, collegeYear, day, week + i, groups[j])
                        if (!groupAvailability) {
                            return res.status(300).send({
                                message: " Le Groupe avec l'id ! " + groups[j] + " n'est pas disponible pour la semaine " + (week + i)
                            })
                        }
                    }
                }
                if (!sameClassroom) {
                    console.log("not same class")
                    let classroomAvailability = await checkClassroomAvailability(startsAt, duree, day, collegeYear, week + i, classroom)
                    if (!classroomAvailability) {
                        return res.status(300).send({
                            available: false,
                            message: " La Salle avec l'id :" + classroom + " n'est pas disponible dans la semaine " + (week + i)
                        })
                    }
                }
                if (!sameTeacher) {
                    console.log("noy same teacher")
                    let teacherAvailability = await checkTeacherAvailability(startsAt, duree, day, collegeYear, week + i, teacher)
                    if (!teacherAvailability) {
                        return res.status(300).send({
                            available: false,
                            message: " Le Prof avec l'id : " + teacher + " n'est pas disponible dans la semaine " + (week + i)
                        })
                    }
                }
            } else {
                return res.status(400).send({
                    error: "Le durée données dépasse l'année universitaire"
                })
            }
        }
        if (i > 1) {
            return res.status(200).send({
                available: true
            })
        }
        else {
            return res.status(500).send({
                available: false
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}



exports.toggleCancelSession = async (req, res) => {
    try {
        const { sessionId, status } = req.params
        const updateSession = await Session.findByIdAndUpdate(sessionId, { canceled: status, treated: true }, { runValidators: true, new: true })
            .populate("group")
            .populate("teacher", "firstName lastName")
            .populate("classroom")
            .populate("subject")
        var notificationData = {}
        if (status == "true") {
            notificationData = { ...notificationData, notificationType: "cancelSession", object: `Une séance a été annuler` }
        } else {
            notificationData = { ...notificationData, notificationType: "activateSession", object: `Une séance a été activer` }
        }
        console.log("hedhaaa")
        console.log(status)
        if (updateSession) {
            try {
                notificationData = {
                    ...notificationData,
                    session: new Types.ObjectId(updateSession._id),
                    content: `Enseignant : ${updateSession.teacher.firstName + " " + updateSession.teacher.lastName} \n Salle : ${updateSession?.classroom?.classroomName} \n Matiere : ${updateSession?.subject?.subjectName} \n Type séance : ${updateSession.sessionType} \n Durée de séance : ${transformToTime(updateSession?.startsAt)}H - ${transformToTime(updateSession?.endsAt)}H`,
                    receivers: [{ receiverId: new Types.ObjectId(updateSession.teacher._id), receiverPath: "Teacher" }, ...(updateSession.group.students ? updateSession.group.students.map((element) => ({ receiverId: new Types.ObjectId(element), receiverPath: "Student" })) : [])],
                }
                notify(notificationData)
            } catch (e) {
                console.log(e)
                console.log("notif error in cancel controller")
            }
            return res.status(200).json({ updated: true })
        }
        return res.status(404).json({ error: "sessionNotFound" })

    } catch (e) {
        console.log(e)
        return res.status(500).json({
            error: "serverSideError"
        })
    }
}

//get teacher Template
exports.getTeacherPlanning = async (req, res) => {
    try {
        const collegeYear = req.params.collegeYear
        const week = req.params.week
        const idTeacher = req.params.idTeacher
        if (!idTeacher || !collegeYear) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        const templates = await Planning.find({ collegeYear: collegeYear, week: week }, "sessions").populate({ path: "sessions", match: { teacher: idTeacher }, populate: [{ path: "examen"}, {path: "correcteur"}, {path: "event"}, { path: "group", populate: { path: "section" } }, { path: "teacher", select: { password: 0 } }, { path: "classroom" }] })
        if (templates) {
            teacherTemplate = templates?.filter((element) => Array.isArray(element.sessions) && element.sessions.length).length ? templates?.filter((element) => Array.isArray(element.sessions)) : []
            teacherTemplate = teacherTemplate.filter(element => element.sessions.length != 0)
            const sessions = templates.flatMap(teacherTemplate => teacherTemplate.sessions);
            return res.status(200).send(sessions)
        } else {
            return res.status(404).send({
                error: "PlanningNotFound"
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}


//---------------teacher planning part---------------------------------------------//
//get current teacher planning

// id collegeYear  // id Teacher // isMe : true wala false

exports.getCurrentTeacherPlanning = async (req, res) => {
    try {
        const collegeYear = req.params.collegeYear
        const idTeacher = req.params.idTeacher
        const isMe = req.params.isMe
        console.log(isMe)
        if (!collegeYear || !idTeacher) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        const year = await CollegeYear.findById(collegeYear).populate({ path: "semesters", select: { dateBegin: 1, dateEnd: 1, name: 1 }, options: { sort: { dateBegin: 1 } } })
        console.log("hello")
        if (year) {
            const templates = await Template.find({ collegeYear: new Types.ObjectId(collegeYear) }, "sessions").populate({ path: "sessions", match: { teacher: idTeacher }, select: { password: 0, image: 0 }, options: { sort: { dateBegin: 1 } } })
            if (templates) {
                const teacherSessions = templates?.filter((element) => Array.isArray(element?.sessions) && element?.sessions?.length).length ? templates?.filter((element) => Array.isArray(element?.sessions)) : []
                var checkTeacherHavePlanning = false
                for (let i = 0; i < teacherSessions.length; i++) {
                    if (teacherSessions[i].sessions?.length > 0) {
                        checkTeacherHavePlanning = true
                    }
                }
                if (checkTeacherHavePlanning) {
                    var numberTotalOfWeeks = 0
                    var infos = []
                    for (let i = 0; i < year.semesters.length; i++) {
                        var currentSemester = year.semesters[i]
                        let currentDateEnd = currentSemester.dateEnd
                        let currentDateBegin = currentSemester.dateBegin
                        let numberOfWeeks = Math.floor(Math.abs(currentDateEnd - currentDateBegin) / (1000 * 60 * 60 * 24 * 7))
                        infos.push({ semester: currentSemester.name, numberOfWeeks: numberOfWeeks, dateBegin: currentDateBegin, dateEnd: currentDateEnd })
                        numberTotalOfWeeks = numberTotalOfWeeks + numberOfWeeks
                    }
                    // this will always return week number 1 
                    const currentDate = new Date()
                    if (req.params.isMe === "true"){
                        console.log("Me")
                        const currentPlannings_1 = await Planning.find({ collegeYear: collegeYear, dateBegin: { $lte: currentDate }, dateEnd: { $gte: currentDate }})
                            .populate({ path: "group", populate: [{ path: "section"}, {path: "students", select : { password : 0, image: 0}}] })
                            .populate("collegeYear")
                            .populate({ 
                                path: "sessions",
                                match: { $or: [ {teacher: idTeacher}, {correcteur: idTeacher} ] }, 
                                populate: [
                                    {path: "examen"},
                                    {path: "correcteur"},
                                    {path: "event"},
                                    {path: "teacher", select: { password: 0}, populate: { path: "subjects", select: { image: 0 }}},
                                    {path: "group", populate: [{ path: "students", select: { password: 0} }, { path: "section" }]},
                                    {path: "subTeacher", select: { password: 0, image: 0 }, populate: { path: "subjects", select: { image: 0 } }},
                                    {path: "subject", populate: { path: "responsibleTeacher"}},
                                    {path: "classroom"}
                                ]
                            })
                        const currentPlannings_responsibleTeacher = await Planning.find({ collegeYear: collegeYear, dateBegin: { $lte: currentDate}, dateEnd: { $gte: currentDate }})
                            .populate({ path: "group", populate: [{ path: "section"}, {path: "students", select : { password : 0, image : 0}}] })
                            .populate("collegeYear")
                            .populate({ 
                                path: "sessions",
                                match: { sessionType: "EXAM"},
                                populate: [
                                    {path: "examen"},
                                    {path: "correcteur"},
                                    {path: "event"},
                                    {path: "teacher", select: { password: 0}, populate: { path: "subjects", select: { image: 0 }}},
                                    {path: "group", populate: [{ path: "students", select: { password: 0 } }, { path: "section" }]},
                                    {path: "subTeacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } }},
                                    {path: "subject", match: { responsibleTeacher: idTeacher },  populate: { path: "responsibleTeacher" }},
                                    {path: "classroom"}
                                ]
                            })
                        if(currentPlannings_1.length == 0 && currentPlannings_responsibleTeacher.length == 0){
                            const initialPlannings_1 = await Planning.find({ collegeYear: collegeYear, week: 1 }).sort({ createdAt: -1 })
                                .populate({
                                    path: "group", 
                                    populate: [
                                        { path: "section" },
                                        { path: "students",
                                        select: { password: 0, image: 0 } }
                                    ]
                                })
                                .populate("collegeYear")
                                .populate({
                                    path: "sessions",
                                    match: {$or: [ {teacher: idTeacher}, {correcteur: idTeacher} ]},
                                    populate: [
                                        {path: "examen"},
                                        {path: "correcteur"},
                                        {path: "event"},
                                        {path: "teacher", select: { password: 0}, populate: { path: "subjects", select: { image: 0 }}},
                                        {path: "group", populate: [{ path: "students", select: { password: 0 } }, { path: "section" }]},
                                        {path: "subTeacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } }},
                                        {path: "subject", populate: { path: "responsibleTeacher" }},
                                        {path: "classroom"}
                                    ] 
                                })
                            const initialPlannings_responsibleTeacher = await Planning.find({ collegeYear: collegeYear, week: 1 }).sort({ createdAt: -1 })
                                .populate({
                                    path: "group", 
                                    populate: [
                                        { path: "section" },
                                        { path: "students",
                                        select: { password: 0, image: 0 } }
                                    ]
                                })
                                .populate("collegeYear")
                                .populate({ 
                                    path: "sessions",
                                    match: { sessionType: "EXAM"},
                                    populate: [
                                        {path: "examen"},
                                        {path: "correcteur"},
                                        {path: "event"},
                                        {path: "teacher", select: { password: 0}, populate: { path: "subjects", select: { image: 0 }}},
                                        {path: "group", populate: [{ path: "students", select: { password: 0 } }, { path: "section" }]},
                                        {path: "subTeacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } }},
                                        {path: "subject", match: { responsibleTeacher: idTeacher },  populate: { path: "responsibleTeacher"}},
                                        {path: "classroom"}
                                    ]
                                })
                            if (!initialPlannings_1.length && !initialPlannings_responsibleTeacher.length) {
                                return res.status(404).json({
                                    message: "PlannigNotFound"
                                })
                            }
                            //perparing for finialInitialPlanning
                            if(initialPlannings_1.length != 0){
                                var finalInitialPlanning1_1 = initialPlannings_1[0]
                                if(initialPlannings_responsibleTeacher.length != 0){
                                    var newInitialPlannings_responsibleTeacher_sessions = initialPlannings_responsibleTeacher.filter((element) => Array.isArray(element?.sessions) && element?.sessions?.length).length ? initialPlannings_responsibleTeacher?.filter((element) => Array.isArray(element?.sessions)) : []
                                    var newInitialPlannings_responsibleTeacher_sessions_latest = newInitialPlannings_responsibleTeacher_sessions.flatMap( pln => pln.sessions)
                                    newInitialPlannings_responsibleTeacher_sessions_latest = newInitialPlannings_responsibleTeacher_sessions_latest.filter( (element) => (element.subject && Object.keys(element.subject).length))
                                }
                                var teacherPlannings_1 = initialPlannings_1.filter((element) => Array.isArray(element.sessions) && element?.sessions?.length).length ? initialPlannings_1?.filter((element) => Array.isArray(element?.sessions)) : []
                                teacherPlannings_1 = teacherPlannings_1.filter(element => element.sessions?.length != 0)
                                const sessions_1 = teacherPlannings_1.flatMap(teacherPlanning => teacherPlanning.sessions);
                                for ( let i=0; i< newInitialPlannings_responsibleTeacher_sessions_latest.length ; i++){
                                    sessions_1.push(newInitialPlannings_responsibleTeacher_sessions_latest[i])
                                }
                                finalInitialPlanning1_1.sessions = sessions_1 || []
                                console.log("ending With sénario intialPlanning Me")
                                return res.status(200).json({
                                    planning: finalInitialPlanning1_1,
                                    initialSemester: year.semesters[0].name,
                                    numberTotalOfWeeks: numberTotalOfWeeks,
                                    infos
                                })
                            }else{
                                var finalInitialPlanning1_1 = initialPlannings_responsibleTeacher[0]
                                var teacherPlannings_1_1_1 = initialPlannings_responsibleTeacher.filter((element) => Array.isArray(element?.sessions) && element?.sessions?.length).length ? initialPlannings_responsibleTeacher?.filter((element) => Array.isArray(element?.sessions)) : []
                                teacherPlannings_1_1_1 = teacherPlannings_1_1_1.filter(element => element?.sessions?.length != 0)
                                const sessions = teacherPlannings_1_1_1.flatMap(teacherPlanning => teacherPlanning.sessions);
                                finalInitialPlanning1_1.sessions = sessions || []
                                return res.status(200).send({
                                    planning: finalInitialPlanning1_1,
                                    initialSemester: year.semesters[0].name,
                                    numberTotalOfWeeks: numberTotalOfWeeks,
                                    infos
                                })
                            }
                        }else{
                            if(currentPlannings_1.length != 0){
                                var finalCurrentPlanning_1_1 = currentPlannings_1[0]
                                if(currentPlannings_responsibleTeacher.length != 0){
                                    var newCurrentPlannings_responsibleTeacher_sessions = currentPlannings_responsibleTeacher.filter((element) => Array.isArray(element?.sessions) && element?.sessions?.length).length ? currentPlannings_responsibleTeacher?.filter((element) => Array.isArray(element?.sessions)) : []
                                    var newCurrentPlannings_responsibleTeacher_sessions_latest = newCurrentPlannings_responsibleTeacher_sessions.flatMap( pln => pln.sessions)
                                    newCurrentPlannings_responsibleTeacher_sessions_latest = newCurrentPlannings_responsibleTeacher_sessions_latest.filter( (element) => (element.subject && Object.keys(element.subject).length))
                                    console.log(newCurrentPlannings_responsibleTeacher_sessions_latest.length)
                                }
                                var teacherPlannings_1_1 = currentPlannings_1.filter((element) => Array.isArray(element?.sessions) && element?.sessions?.length).length ? currentPlannings_1?.filter((element) => Array.isArray(element?.sessions)) : []
                                teacherPlannings_1_1 = teacherPlannings_1_1.filter(element => element?.sessions?.length != 0)
                                const sessions = teacherPlannings_1_1.flatMap(teacherPlanning => teacherPlanning.sessions);
                                console.log(sessions.length)
                                for ( let i=0; i< newCurrentPlannings_responsibleTeacher_sessions_latest.length ; i++){
                                    sessions.push(newCurrentPlannings_responsibleTeacher_sessions_latest[i])
                                }
                                console.log(finalCurrentPlanning_1_1.sessions.length)
                                finalCurrentPlanning_1_1.sessions = sessions || []
                                console.log("ending With sénario currentPlanning Me")
                                return res.status(200).send({
                                    planning: finalCurrentPlanning_1_1,
                                    initialSemester: year.semesters[0].name,
                                    numberTotalOfWeeks: numberTotalOfWeeks,
                                    infos
                                })
                            }else{
                                var finalCurrentPlanning_1_1 = currentPlannings_responsibleTeacher[0]
                                var teacherPlannings_1_1 = currentPlannings_responsibleTeacher.filter((element) => Array.isArray(element?.sessions) && element?.sessions?.length).length ? currentPlannings_responsibleTeacher?.filter((element) => Array.isArray(element?.sessions)) : []
                                teacherPlannings_1_1 = teacherPlannings_1_1.filter(element => element?.sessions?.length != 0)
                                const sessions = teacherPlannings_1_1.flatMap(teacherPlanning => teacherPlanning.sessions);
                                finalCurrentPlanning_1_1.sessions = sessions || []
                                return res.status(200).send({
                                    planning: finalCurrentPlanning_1_1,
                                    initialSemester: year.semesters[0].name,
                                    numberTotalOfWeeks: numberTotalOfWeeks,
                                    infos
                                })
                            }
                        }
                    }else{
                        const currentPlannings = await Planning.find({ collegeYear: collegeYear, dateBegin: { $lte: currentDate }, dateEnd: { $gte: currentDate } })
                        .populate({ path: "group", populate: [{ path: "section" }, { path: "students", select: { password: 0 } }] })
                        .populate("collegeYear")
                        .populate({ path: "sessions", match: { teacher: idTeacher }, populate: [{ path: "examen"}, {path: "correcteur"}, {path: "event"}, { path: "teacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "group", populate: [{ path: "students", select: { password: 0 } }, { path: "section" }] }, { path: "subTeacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "subject", populate: { path: "responsibleTeacher" }, }, { path: "classroom" }] })
                        if (!currentPlannings.length) {
                            const initialPlannings = await Planning.find({ collegeYear: collegeYear, week: 1 }).sort({ createdAt: -1 })
                                .populate({ path: "group", populate: [{ path: "section" }, { path: "students", select: { password: 0 } }] })
                                .populate("collegeYear")
                                .populate({ path: "sessions", match: { teacher: idTeacher }, populate: [{ path: "examen"}, {path: "correcteur"}, {path: "event"}, { path: "teacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "group", populate: [{ path: "students", select: { password: 0 } }, { path: "section" }] }, { path: "subTeacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "subject", populate: { path: "responsibleTeacher" }, }, { path: "classroom" }] })
                            if (!initialPlannings.length) {
                                return res.status(404).json({
                                    message: "PlannigNotFound"
                                })
                            }
                            var finalInitialPlanning1 = initialPlannings[0]
                            var teacherPlannings = initialPlannings.filter((element) => Array.isArray(element.sessions) && element?.sessions?.length).length ? initialPlannings?.filter((element) => Array.isArray(element?.sessions)) : []
                            teacherPlannings = teacherPlannings.filter(element => element.sessions?.length != 0)
                            const sessions = initialPlannings.flatMap(teacherPlanning => teacherPlanning.sessions);
                            finalInitialPlanning1.sessions = sessions
                            console.log("normalSenario")
                            return res.status(200).json({
                                planning: finalInitialPlanning1,
                                initialSemester: year.semesters[0].name,
                                numberTotalOfWeeks: numberTotalOfWeeks,
                                infos
                            })
                        } else {
                            var finalCurrentPlanning = currentPlannings[0]
                            var teacherPlannings = currentPlannings.filter((element) => Array.isArray(element?.sessions) && element?.sessions?.length).length ? currentPlannings?.filter((element) => Array.isArray(element?.sessions)) : []
                            teacherPlannings = teacherPlannings.filter(element => element?.sessions?.length != 0)
                            const sessions = currentPlannings.flatMap(teacherPlanning => teacherPlanning.sessions);
                            finalCurrentPlanning.sessions = sessions || []
                            console.log("normalSenario")
                            return res.status(200).send({
                                planning: finalCurrentPlanning,
                                initialSemester: year.semesters[0].name,
                                numberTotalOfWeeks: numberTotalOfWeeks,
                                infos
                            })
                        }
                    }
                } else {
                    return res.status(204).send({
                        message: "Teacher with id " + idTeacher + " does not have any planning"
                    })
                }
            }
        } else {
            return res.status(404).json({
                error: "College Year with id : " + collegeYear + "NotFound"
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}

//get teacher planning by next week
exports.getNextTeacherPlanning = async (req, res) => {
    const collegeYear = req.params.collegeYear
    const week = req.params.week
    const nbrNextWeek = req.query.nbrNextWeek ? Number(req.query.nbrNextWeek) : 1
    const idTeacher = req.params.idTeacher
    const isMe = req.params.isMe
    console.log("collegeYear  " + collegeYear)
    console.log("week  " + week)
    console.log(" idTeacher " + idTeacher)
    console.log("nbrNextWeek " + nbrNextWeek)

    try {
        if (!week || !collegeYear) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        if(isMe == "true"){
            var planning = await Planning.find({ collegeYear: collegeYear, week: Number(week) + nbrNextWeek }).sort({ createdAt: -1 })
                .populate({ path: "group", populate: [{ path: "section" }, { path: "students", select: { password: 0 } }] })
                .populate("collegeYear")
                .populate({ 
                    path: "sessions",
                    match: { $or: [ {teacher: idTeacher}, {correcteur: idTeacher} ] },
                    populate: [
                        { path: "examen"}, 
                        {path: "correcteur"}, 
                        {path: "event"}, 
                        { path: "teacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, 
                        { path: "group", populate: [[{ path: "students", select: { password: 0 } }, { path: "section" }], { path: "section" }] },
                        { path: "subTeacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, 
                        { path: "subject", populate: { path: "responsibleTeacher" } }, 
                        { path: "classroom" }
                    ] 
                })        
            var planning_responsibles = await Planning.find({ collegeYear: collegeYear, week: Number(week) + nbrNextWeek }).sort({ createdAt: -1 })
                .populate({ path: "group", populate: [{ path: "section" }, { path: "students", select: { password: 0 } }] })
                .populate("collegeYear")
                .populate({ 
                    path: "sessions",
                    match: { sessionType: "EXAM" },
                    populate: [
                        { path: "examen"}, 
                        { path: "correcteur"}, 
                        { path: "event"}, 
                        { path: "teacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, 
                        { path: "group", populate: [[{ path: "students", select: { password: 0 } }, { path: "section" }], { path: "section" }] },
                        { path: "subTeacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, 
                        { path: "subject", populate: { path: "responsibleTeacher" } }, 
                        { path: "classroom" }
                    ] 
                }) 
            if ( (planning.length == 0) && (planning_responsibles.length == 0)) {
                return res.status(404).send({
                    message: "PlannigNotFound"
                })
            }
            // adding the new algo to filter the sessions
            if(planning.length != 0){
                var finalInitialPlanning1_1 = planning[0]
                if(planning_responsibles.length != 0){
                    var newInitialPlannings_responsibleTeacher_sessions = planning_responsibles.filter((element) => Array.isArray(element?.sessions) && element?.sessions?.length).length ? planning_responsibles?.filter((element) => Array.isArray(element?.sessions)) : []
                    var newInitialPlannings_responsibleTeacher_sessions_latest = newInitialPlannings_responsibleTeacher_sessions.flatMap( pln => pln.sessions)
                    newInitialPlannings_responsibleTeacher_sessions_latest = newInitialPlannings_responsibleTeacher_sessions_latest.filter( (element) => (element.subject && Object.keys(element.subject).length))
                }
                var teacherPlannings_1 = planning.filter((element) => Array.isArray(element.sessions) && element?.sessions?.length).length ? planning?.filter((element) => Array.isArray(element?.sessions)) : []
                teacherPlannings_1 = teacherPlannings_1.filter(element => element.sessions?.length != 0)
                const sessions_1 = teacherPlannings_1.flatMap(teacherPlanning => teacherPlanning.sessions);
                for ( let i=0; i< newInitialPlannings_responsibleTeacher_sessions_latest.length ; i++){
                    sessions_1.push(newInitialPlannings_responsibleTeacher_sessions_latest[i])
                }
                finalInitialPlanning1_1.sessions = sessions_1 || []
                console.log("ending With sénario intialPlanning Me")
                return res.status(200).json(finalInitialPlanning1_1)
            }else{
                var finalInitialPlanning1_1 = planning_responsibles[0]
                var teacherPlannings_1_1_1 = planning_responsibles.filter((element) => Array.isArray(element?.sessions) && element?.sessions?.length).length ? planning_responsibles?.filter((element) => Array.isArray(element?.sessions)) : []
                teacherPlannings_1_1_1 = teacherPlannings_1_1_1.filter(element => element?.sessions?.length != 0)
                const sessions = teacherPlannings_1_1_1.flatMap(teacherPlanning => teacherPlanning.sessions);
                finalInitialPlanning1_1.sessions = sessions || []
                return res.status(200).send(finalInitialPlanning1_1)
            }
        }else{
            var planning = await Planning.find({ collegeYear: collegeYear, week: Number(week) + nbrNextWeek }).sort({ createdAt: -1 })
            .populate({ path: "group", populate: [{ path: "section" }, { path: "students", select: { password: 0 } }] })
            .populate("collegeYear")
            .populate({ 
                path: "sessions",
                match: { teacher: idTeacher },
                populate: [
                    { path: "examen"}, 
                    {path: "correcteur"}, 
                    {path: "event"}, 
                    { path: "teacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, 
                    { path: "group", populate: [[{ path: "students", select: { password: 0 } }, { path: "section" }], { path: "section" }] },
                    { path: "subTeacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, 
                    { path: "subject", populate: { path: "responsibleTeacher" } }, 
                    { path: "classroom" }
                ] 
            })        
            if (!planning) {
                return res.status(404).send({
                    message: "PlannigNotFound"
                })
            }
            var finalPlanning = planning[0]
            var teacherPlannings = planning?.filter((element) => Array.isArray(element.sessions) && element.sessions.length).length ? planning?.filter((element) => Array.isArray(element.sessions)) : []
            teacherPlannings = teacherPlannings.filter(element => element.sessions.length != 0)
            const sessions = teacherPlannings.flatMap(trPs => trPs.sessions);
            finalPlanning.sessions = sessions
            return res.status(200).send(finalPlanning)
        }
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}

//get teacher planning by pred week 
exports.getPredTeacherPlanning = async (req, res) => {
    const collegeYear = req.params.collegeYear
    const week = req.params.week
    const nbrPredWeek = req.query.nbrNextWeek ? Number(req.query.nbrNextWeek) : 1
    const idTeacher = req.params.idTeacher
    const isMe = req.params.isMe
    try {
        if (!week || !collegeYear) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        if(isMe == "true"){
            const planning = await Planning.find({ collegeYear: collegeYear, week: Number(week) - nbrPredWeek }).sort({ createdAt: -1 })
                .populate({ path: "group", populate: [{ path: "section" }, { path: "students", select: { password: 0 } }] })
                .populate("collegeYear")
                .populate({
                    path: "sessions",
                    match: { $or: [ {teacher: idTeacher}, {correcteur: idTeacher}] },
                    populate: [
                        { path: "examen"}, 
                        {path: "correcteur"}, 
                        {path: "event"}, 
                        { path: "teacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, 
                        { path: "group", populate: [{ path: "students", select: { password: 0 } }, { path: "section" }] }, 
                        { path: "subTeacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, 
                        { path: "subject", populate: { path: "responsibleTeacher" }, }, { path: "classroom" }
                    ] 
                })
            const planning_responsabilites = await Planning.find({ collegeYear: collegeYear, week: Number(week) - nbrPredWeek }).sort({ createdAt: -1 })
                .populate({ path: "group", populate: [{ path: "section" }, { path: "students", select: { password: 0 } }] })
                .populate("collegeYear")
                .populate({
                    path: "sessions",
                    match: { sessionType: "EXAM" },
                    populate: [
                        { path: "examen"}, 
                        {path: "correcteur"}, 
                        {path: "event"}, 
                        { path: "teacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, 
                        { path: "group", populate: [{ path: "students", select: { password: 0 } }, { path: "section" }] }, 
                        { path: "subTeacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, 
                        { path: "subject", populate: { path: "responsibleTeacher" }, }, { path: "classroom" }
                    ] 
                })
            if ( (planning.length == 0) && (planning_responsabilites.length == 0)) {
                return res.status(404).send({
                    message: "PlannigNotFound"
                })
            }
            if(planning.length != 0){
                var finalInitialPlanning1_1 = planning[0]
                if(planning_responsabilites.length != 0){
                    var newInitialPlannings_responsibleTeacher_sessions = planning_responsabilites.filter((element) => Array.isArray(element?.sessions) && element?.sessions?.length).length ? planning_responsabilites?.filter((element) => Array.isArray(element?.sessions)) : []
                    var newInitialPlannings_responsibleTeacher_sessions_latest = newInitialPlannings_responsibleTeacher_sessions.flatMap( pln => pln.sessions)
                    newInitialPlannings_responsibleTeacher_sessions_latest = newInitialPlannings_responsibleTeacher_sessions_latest.filter( (element) => (element.subject && Object.keys(element.subject).length))
                }
                var teacherPlannings_1 = planning.filter((element) => Array.isArray(element.sessions) && element?.sessions?.length).length ? planning?.filter((element) => Array.isArray(element?.sessions)) : []
                teacherPlannings_1 = teacherPlannings_1.filter(element => element.sessions?.length != 0)
                const sessions_1 = teacherPlannings_1.flatMap(teacherPlanning => teacherPlanning.sessions);
                for ( let i=0; i< newInitialPlannings_responsibleTeacher_sessions_latest.length ; i++){
                    sessions_1.push(newInitialPlannings_responsibleTeacher_sessions_latest[i])
                }
                finalInitialPlanning1_1.sessions = sessions_1 || []
                console.log("ending With sénario intialPlanning Me")
                return res.status(200).json(finalInitialPlanning1_1)
            }else{
                var finalInitialPlanning1_1 = planning_responsabilites[0]
                var teacherPlannings_1_1_1 = planning_responsabilites.filter((element) => Array.isArray(element?.sessions) && element?.sessions?.length).length ? planning_responsabilites?.filter((element) => Array.isArray(element?.sessions)) : []
                teacherPlannings_1_1_1 = teacherPlannings_1_1_1.filter(element => element?.sessions?.length != 0)
                const sessions = teacherPlannings_1_1_1.flatMap(teacherPlanning => teacherPlanning.sessions);
                finalInitialPlanning1_1.sessions = sessions || []
                return res.status(200).send(finalInitialPlanning1_1)
            }
        }else{
            const planning = await Planning.find({ collegeYear: collegeYear, week: Number(week) - nbrPredWeek }).sort({ createdAt: -1 })
            .populate({ path: "group", populate: [{ path: "section" }, { path: "students", select: { password: 0 } }] })
            .populate("collegeYear")
            .populate({ path: "sessions", select: { teacher: idTeacher }, populate: [{ path: "examen"}, {path: "correcteur"}, {path: "event"}, { path: "teacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "group", populate: [{ path: "students", select: { password: 0 } }, { path: "section" }] }, { path: "subTeacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "subject", populate: { path: "responsibleTeacher" }, }, { path: "classroom" }] })
            if (!planning) {
                return res.status(404).send({
                    message: "PlannigNotFound"
                })
            }
            var finalPlanning = planning[0]
            var teacherPlannings = planning?.filter((element) => Array.isArray(element.sessions) && element.sessions.length).length ? planning?.filter((element) => Array.isArray(element.sessions)) : []
            teacherPlannings = teacherPlannings.filter(element => element.sessions.length != 0)
            const sessions = teacherPlannings.flatMap(trPs => trPs.sessions);
            finalPlanning.sessions = sessions
            return res.status(200).send(finalPlanning)
        }
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }

}


exports.changeTeacherController = async (req, res) => {
    try {
        const { sessionId, idSubTeacher } = req.params
        console.log(sessionId)
        console.log(idSubTeacher)
        if (!sessionId || !idSubTeacher) {
            return res.status(400).send({
                error: "Bad Request"
            })
        }
        const session = await Session.findByIdAndUpdate(sessionId, { subTeacher: idSubTeacher, treated: true }, { new: true })
            .populate([
                { path: "teacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } },
                { path: "group", populate: [{ path: "students", select: { password: 0 } }, { path: "section" }] },
                { path: "subTeacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } },
                { path: "subject", populate: { path: "responsibleTeacher" }, },
                { path: "classroom" }
            ])
        if (!session) {
            return res.status(404).send({
                message: "id: " + sessionId + "Not Found"
            })
        }
        return res.status(200).send({
            updated: true,
            session
        })
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: e.message,
            message: "Server Error"
        })
    }
}


//change weekType 
exports.changeWeekType = async (req, res) => {
    try {
        const { idPlanning, weekType } = req.params
        if (!idPlanning || !weekType) {
            return res.status(400).send({
                message: "Bad Request"
            })
        }
        const planning = await Planning.findByIdAndUpdate(Types.ObjectId(idPlanning), { weekType: weekType, sessions: [] }, { new: true })
        if (planning) {
            return res.status(200).send({
                planning,
                updated: true
            })
        } else {
            return res.status(404).send({
                message: "Planning with id: " + idPlanning + " Not found"
            })
        }
    } catch (e) {
        return res.status(500).send({
            error: e.message,
            messaage: "Server ERROR"
        })
    }
}

// exports.createInitialTemplate = async (req, res) => {
//     //test if modified or not
//     try {
//         //Initialize my Template and create an Initial Planning
//         //sessions group semester default week = 1
//         // var selectedSessions = []
//         // for (var session of req.body.sessions) {
//         //     const existedSession = await Session.find(
//         //         {
//         //             teacher: session.teacher,
//         //             classroom: session.classroom,
//         //             group: req.body.group,
//         //             day: session.day,
//         //             startsAt: session.startsAt,
//         //             subject: session.subject,
//         //             sessionType: session.sessionType,
//         //             createdBy: session.createdBy
//         //         }
//         //     )
//         //     if (!existedSession.length) { selectedSessions.push(session) }
//         // }
//         const sessionTemplate = await Session.create(req.body.sessions)
//         for (s of sessionTemplate) {
//             await s.save()
//         }
//         // const tempSessions = await Session.getDistinctLatestSessionTemplate(req.body.group, "template")
//         const sessionsIds = sessionTemplate.map((element) => element._id)
//         const planning = await Planning.create({ ...req.body, sessions: sessionsIds, week: 1 })
//         await planning.save()
//         return res.status(201).json(planning)
//     } catch (e) {
//         console.log(e)
//         if (e.errors) {
//             return res.status(400).send({
//                 error: "badRequest"
//             })
//         }
//         return res.status(500).send({
//             error: e.message,
//             message: "Server ERROR!"
//         })
//     }
// }


// exports.getTemplate = async (req, res) => {
//     try {
//         var tempSessions = await Session.getDistinctLatestSessionTemplate(req.params.groupId, "template")
//         if (tempSessions.length !== 0) return res.status(200).json({ tempSessions, found: true })
//         else return res.status(204).json({ found: false })
//     } catch (e) {
//         console.log(e)
//         if (e.errors) {
//             return res.status(400).json({//need test
//                 error: "badRequest"
//             })
//         }
//         return res.status(500).send({
//             error: e.message,
//             message: "Server ERROR!"
//         })
//     }
// }



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
// exports.refreshPlanning = async (req, res) => {
//     //Valid for refreshing With creation of a new planning
//     //Valid for refreshing With an existing planning  (Still working...)
//     // fel front ki bech naffichi el sessions mte3i ba3d marefreshit el planning bech nparkouri ken nel9a session manula fel wa9t nafsou m3a session template ====> n'affichi el manual
//     try {
//         const week = req.params.week
//         const groupId = req.params.groupId
//         const semesterId = req.params.semesterId
//         const planning = await Planning.findOne({ group: groupId, week: Number(week) + 1, semesterId: semesterId })
//         if (planning) {
//             const planningPopulated = await planning.populate("sessions")
//             console.log(planning)
//             if (!planningPopulated.sessions.find( element => element.sessionCategorie === 'template')){
//                 var tempSessions = await Session.getDistinctLatestSessionTemplate(req.params.groupId, "template")
//                 const sessionsIds = tempSessions.map((element) => element._id)
//                 if (sessionsIds.length != 0) {
//                     for (let tmpSession of sessionsIds) {
//                         planning.sessions.push(tmpSession)
//                     }
//                 }
//                 planning.save().then(data => {
//                     return res.status(200).send({
//                         data,
//                         refreshed: true
//                     })
//                 }).catch(err => {
//                     return res.status(400).send({
//                         error: err.message,
//                         message: "Some ERROR  occured while refreshing the template"
//                     })
//                 })
//             }
//             return res.status(200).send({
//                 planningPopulated,
//                 message : "Planning allready Refreshed!"
//             })
//         } else {
//             console.log(req.params)
//             const tmpOnes = await Session.aggregate([
//                 { $sort: { "createdAt": -1 } },
//                 { $match: { group: new Types.ObjectId(groupId) , sessionCategorie : "template"} },
//                 {
//                     $group: {
//                         _id: { day: "$day", startsAt: "$startsAt" },
//                         doc: { $first: "$$ROOT" }
//                     },
//                 },
//                 {
//                     $replaceRoot: {
//                         newRoot: "$doc"
//                     }
//                 }
//             ])
//             const sessionsIds = tmpOnes.map((element) => element._id)
//             console.log(sessionsIds)
//             const nextWeek = Number(week) + 1
//             const newPlanning = await Planning.create({
//                 group: groupId,
//                 semester: semesterId,
//                 sessions: sessionsIds,
//                 week: nextWeek
//             })
//             newPlanning.save().then(data => {
//                 return res.status(201).send({
//                     data,
//                     refreshed: true
//                 })
//             }).catch(err => {
//                 return res.status(400).send({
//                     error: err.message,
//                     message: "Some error occured while refreshing the Planning"
//                 })
//             })
//         }
//     } catch (e) {
//         return res.status(500).send({
//             error: e.message,
//             message: "Server ERROR!"
//         })
//     }
// }


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
// exports.getPlanning = async (req, res) => {
//     // need aggregate to synchronise the modification
//     try {
//         // const planning = await Planning.aggregate(req.params.week, req.params.groupId, req.params.semesterId)
//         const planning = await Planning.aggregate([
//             {
//                 $match: {
//                     week: Number(req.params.week),
//                     group: Types.ObjectId(req.params.groupId),
//                     semester: Types.ObjectId(req.params.semesterId)
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'sessions', // Name of the referenced collection
//                     localField: 'sessions',
//                     foreignField: '_id',
//                     as: 'sessionsData', // Field to store the populated data
//                 }
//             },
//             { $unwind: '$sessionsData' },
//             { $sort: { "sessionsData.createdAt": -1 } },
//             {
//                 $group: {
//                     _id: { day: "$sessionsData.day", startsAt: "$sessionsData.startsAt" },
//                     session: { $first: "$sessionsData" },
//                 },
//             },
//             {
//                 $replaceRoot: {
//                     newRoot: "$session"
//                 }
//             }
//         ])
//         if (!planning) {
//             return res.status(404).send({
//                 message: "Planning of group " + req.params.groupId + " Not Found!",
//                 error: "NotFound",
//                 found: false
//             })
//         }
//         return res.status(200).send({
//             planning,
//             found: true
//         })
//     } catch (e) {
//         console.log(e)
//         return res.status(500).send({
//             error: e.message,
//             message: "Server ERROR!"
//         })
//     }
// }



















// exports.create = async (req, res) => {
//     try {
//         const planning = await Planning.create(req.body)
//         await planning.save()
//         return res.status(201).json(planning)
//     } catch (e) {
//         console.log(e)
//         if (e.code === 11000) {
//             return res.status(409).json({
//                 error: "conflictPlanning",
//                 message: "week , group and semester combination are already used"
//             })
//         }
//         if (e.errors?.week?.properties) return res.status(400).json({
//             error: e.errors.week.properties.message
//         })
//         else if (e.errors?.semester?.properties?.message === "semesterRequired")
//             return res.status(400).json({
//                 error: "semesterRequired"
//             })
//         else if (e.errors?.dateBegin?.properties?.message === "dateBeginRequired")
//             return res.status(400).json({
//                 error: "dateBeginRequired"
//             })
//         else if (e.errors?.dateEnd?.properties?.message === "dateEndRequired")
//             return res.status(400).json({
//                 error: "dateEndRequired"
//             })
//         else if (e.errors?.group?.properties?.message === "groupRequired")
//             return res.status(400).json({
//                 error: "groupRequired"
//             })
//         else if (e.errors)
//             return res.status(400).json({
//                 error: "badRequest"
//             })
//         else
//             return res.status(500).json({
//                 error: "serverSideError"
//             })
//         // if (e.errors?.week || e.errors?.dateBegin || e.errors?.dateEnd || e.errors?.group)
//         //     return res.status(400).json({
//         //         error: "badRequest"
//         //     })
//     }
// }


// exports.getAll = async (req, res) => {
//     try {
//         const plannings = await Planning.find(req.body)
//             .populate("semester")
//         // .populate({ path: "group", populate: { path: "section" } }) comments cause we find by groupe
//         return plannings.length
//             ? res.status(200).json({ found: true, plannings })
//             : res.status(204).json({ found: false })
//     } catch (e) {
//         console.log(e)
//         return res.status(500).json({
//             error: "serverSideError"
//         })
//     }
// }



// exports.getById = async (req, res) => {
//     try {
//         const { planningId } = req.params
//         const planning = await Planning.findById(planningId)
//         return planning
//             ? res.status(200).json({ found: true, planning })
//             : res.status(404).json({ found: false })
//     } catch (e) {
//         console.log(e)
//         return res.status(500).json({
//             error: "serverSideError"
//         })
//     }
// }


// exports.deleteById = async (req, res) => {//delete only manual sessions with the planning => en cas ou
//     try {
//         const { planningId } = req.params
//         const planning = await Planning.findByIdAndRemove(planningId)
//         return planning
//             ? res.status(200).json({ found: true, planning })
//             : res.status(404).json({ found: false })
//     } catch (e) {
//         return res.status(500).json({
//             error: "serverSideError"
//         })
//     }
// }




// exports.update = async (req, res) => {
//     try {
//         const planning = await Planning.findByIdAndUpdate(req.params.planningId, req.body, {
//             new: true,
//             runValidators: true
//         })
//         return planning
//             ? res.status(200).json({ planning, found: true })
//             : res.status(404).json({ found: false })
//     } catch (e) {
//         console.log(e)
//         if (e.code === 11000) {
//             return res.status(409).json({
//                 error: "conflictPlanning",
//                 message: "week , group and semester combination are already used"
//             })
//         }
//         else if (e.errors?.week?.properties) return res.status(400).json({
//             error: e.errors.week.properties.message
//         })
//         else if (e.errors)
//             return res.status(400).json({
//                 error: "badRequest"
//             })
//         else
//             return res.status(500).json({
//                 error: "serverSideError"
//             })
//     }
// }
