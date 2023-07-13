const Planning = require("../models/Planning.model")
const Section = require("../models/section.model")
const Semester = require("../models/semester.model")
const CollegeYear = require("../models/collegeYear.model")
const Group = require("../models/group.model")
const Teacher = require("../models/Users/teacher.model")
const { Subject } = require("../models/subject.model")
const Classroom = require("../models/classroom.model")
const Examen = require("../models/examen.model")
const Session = require("../models/session.model")
const { Types } = require("mongoose")
const { notify } = require("../functions/Notify")
const { logData } = require("../functions/logging")







//Création d'un examen dans un Planning
exports.createExam = async (req, res) => {
    try {
        // sessions = [ { teacher, classroom, group, invitedActor }, { teacher, classroom, group, invitedActor }]
        //examenNumer = 1,2,3
        //examenType = ["Synthèse", "Atelier", "Controle", "Tp"]
        //subject = { _id: 1558969855, name: "Math" }  // to optimize and do not perform one additional request
        console.log(req.body)
        const {
            sessions,
            subject,
            day,
            startsAt,
            endsAt,
            week,
            dateDebPlanning,
            semesterId,
            examenType,
            examenNumber,
            collegeYearId,
            currentPlanningId,
            responsibleNotes
        } = req.body
        if ( !sessions || sessions.length == 0 || !subject || (!day && day != 0) || !startsAt || !endsAt || !week || !dateDebPlanning || !semesterId || !examenType || !examenNumber || !collegeYearId) {
            return res.status(400).send({
                message: "Server Error"
            })
        }
        //Preparing the starting DATE and the ending DATE of the exam
        var starting_date_planning = new Date(dateDebPlanning)
        var realDay = day === 0 ? 7 : day
        var exam_starting_day = addDays(starting_date_planning, Number(realDay - 1))
        var exam_starting_resetedTomidNight = resetTimeToMidnight(exam_starting_day)
        var exam_ending_day = exam_starting_resetedTomidNight
        var exam_final_starting_date = addMinutes(exam_starting_resetedTomidNight, Number(startsAt))
        var exam_final_ending_date = addMinutes(exam_ending_day, Number(endsAt))
        const examTitle = subject.name + "-" + examenType + "-" + examenNumber
        const concernedGroups = sessions.map((element) => (element.group))
        const exam = await Examen.create({
            examTitle: examTitle,
            collegeYear: collegeYearId,
            semester: semesterId,
            examType: examenType,
            examNumber: examenNumber,
            beginDate: new Date(exam_final_starting_date),
            endingDate: new Date(exam_final_ending_date),
            groups: concernedGroups,
            subject: subject._id,
            responsibleNotes: responsibleNotes || null
        })
        console.log(exam)
        await exam.save()
        var newPlanning = {}
        for (let i = 0; i < sessions.length; i++) {
            let currentSessionData = sessions[i]
            // find the planning correspendant to the session
            const planning = await Planning.findOne({ group: Types.ObjectId(currentSessionData.group), collegeYear: Types.ObjectId(collegeYearId), week: Number(week) })
                .populate({
                    path: "sessions",
                    match: {
                        day: Number(day),
                        $or: [
                            { startsAt: { $lt : Number(startsAt)}, endsAt: { $gt: Number(endsAt)}},
                            { startsAt: { $lt : Number(startsAt)}, endsAt: { $lte: Number(endsAt), $gt: Number(startsAt) }},
                            { startsAt: Number(startsAt)},
                            { startsAt: { $gt: Number(startsAt), $lt: Number(endsAt)}}
                            //dqs
                            // { startsAt: { $lte: Number(startsAt) }, endsAt: { $lte: Number(endsAt), $gte: Number(startsAt) } },
                            // { startsAt: { $gte: Number(startsAt), $lte: Number(endsAt) }, endsAt: { $gte: Number(endsAt) } },
                            // { startsAt: { $gte: Number(startsAt) }, endsAt: { $lte: Number(endsAt) } }
                        ]
                    }
                })
            if (planning) {
                const session = await Session.create({
                    teacher: Types.ObjectId(currentSessionData.teacher),
                    classroom: Types.ObjectId(currentSessionData.classroom),
                    invitedActor: currentSessionData.invitedActor || null,
                    group: Types.ObjectId(currentSessionData.group),
                    subject: Types.ObjectId(subject._id),
                    day: Number(day),
                    startsAt: Number(startsAt),
                    endsAt: Number(endsAt),
                    sessionType: "EXAM",
                    examen: exam._id,
                    initialSubGroup: "All",
                    sessionCategorie: "Planning",
                    correcteur: Types.ObjectId(currentSessionData.correcteur)
                })
                await session.save()
                console.log(session)
                if (planning.sessions.length != 0) {
                    planning.sessions = []
                }
                planning.sessions.push(session)
                await planning.save()
                if (currentPlanningId == planning._id.toString()) {
                    newPlanning = await Planning.findById(currentPlanningId).populate([{ path: "collegeYear" }, { path: "sessions", populate: [{ path: "examen"}, {path: "correcteur"}, { path: "teacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "group", populate: [{ path: "students", select: { password: 0 } }, { path: "section" }] }, { path: "subTeacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "subject", populate: { path: "responsibleTeacher" } }, { path: "classroom" }] }])
                }
            } else {
                continue
            }
        }
        return res.status(200).send({
            created: true,
            newPlanning
        })
    } catch (e) {
        console.log(e)
        if (e.code === 11000) {
            return res.status(409).send({
                error: "conflictExamen"
            })
        }
        return res.status(500).send({
            message: "Server Error",
            error: e.message
        })
    }
}





exports.updateSessionExam = async (req, res) => {
    const { idSession,
        teacher,
        classroom,
        subject,
        startsAt,
        endsAt,
        dateDebPlanning,
        examenType,
        examenNumber,
    } = req.params
    try {
        if (!idSession) {
            return res.status(400).send({
                message: "Bad Request"
            })
        }
        var newDateCheck = false
        const session = await Session.findById(Types.ObjectId(idSession)).populate("examen")
        if (session) {
            if (Number(session.startsAt) != Number(startsAt) || Number(session.endsAt) != Number(endsAt)) {
                newDateCheck = true
            }
            if (session.teacher.toString() != teacher || session.classroom.toString() != classroom || session.subject.toString() != subject || newDateCheck == true) {
                session.teacher = Types.ObjectId(teacher)
                session.classroom = Types.ObjectId(classroom)
                session.subject = Types.ObjectId(subject._id)
                session.startsAt = startsAt
                session.endsAt = endsAt
                if (newDateCheck) {
                    var starting_date_planning = new Date(dateDebPlanning)
                    var realDay = Number(session.day) === 0 ? 7 : day
                    var exam_starting_day = addDays(starting_date_planning, Number(realDay - 1))
                    var exam_starting_resetedTomidNight = resetTimeToMidnight(exam_starting_day)
                    var exam_ending_day = exam_starting_resetedTomidNight
                    var exam_final_starting_date = addMinutes(exam_starting_resetedTomidNight, Number(startsAt))
                    var exam_final_ending_date = addMinutes(exam_ending_day, Number(endsAt))
                }
                if (Number(examenNumber) != Number(session.examen.examenNumber) || examenType != session.examen.examenType) {
                    var examTitle = subject.name + "-" + examenType + "-" + examenNumber
                }
                const exam = await Examen.create({
                    examTitle: examTitle,
                    collegeYear: Types.ObjectId(session.examen.collegeYear),
                    semester: Types.ObjectId(session.examen.semesterId),
                    examType: examenType,
                    examNumber: examenNumber,
                    beginDate: new Date(exam_final_starting_date),
                    endingDate: new Date(exam_final_ending_date),
                })
                await exam.save()
                session.examen = {}
                session.examen = exam._id
                await session.save()
                return res.status(200).send({
                    session,
                    updated: true
                })
            }
        } else {
            return res.status(404).send({
                message: "Session with id: " + idSession + " Not Found"
            })
        }
    } catch (e) {
        return res.status(500).send({
            error: "Server Error"
        })
    }

}




exports.findAvailableTeachersForExams = async (req, res) => {
    try {
        const { startsAt, duree, day, collegeYear, week } = req.params
        if (!startsAt || !duree || (!day && day != 0) || !collegeYear || !week) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        var teachers = await Teacher.find({}, { select: { image: 0, note: 0, birth: 0, maritalStatus: 0, password: 0 } })
        if (!teachers) {
            return res.status(204).send({
                error: "EmptyDataBase",
                message: "There is no Teachers in Data base"
            })
        } else {
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
                        teachers = teachers.filter((element) => OccupiedPredTeachers[i]?.sessions[0]?.teacher?.toString() != element?._id?.toString())
                    }
                }
            }
            for (let j = 0; j < OccupiedNextTeachers.length; j++) {
                if (OccupiedNextTeachers[j].sessions?.length) {
                    if ((Number(OccupiedNextTeachers[j]?.sessions[0]?.startsAt) < Number(startsAt) + Number(duree))) {
                        console.log("edszdqs")
                        teachers = teachers.filter((element) => OccupiedNextTeachers[j]?.sessions[0]?.teacher?.toString() != element?._id?.toString())
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
                        newOccupiedTeachers[curr] = OccupiedTeachers[i]?.sessions[0]?.teacher?.toString()
                        curr = curr + 1
                    }
                }
                // newOccupiedTeachers = OccupiedTeachers.reduce((a, b, index) => index !== 1 ? [...a, ...b.sessions] : [...a.sessions, b.sessions]).map((element) => element.teacher?.toString()) || []
            }
            else if (OccupiedTeachers.length === 1) {
                newOccupiedTeachers = OccupiedTeachers[0].sessions?.map((element) => element?.teacher?.toString()) || []
                //OccupiedTeachers = [OccupiedTeachers[0].teacher.toString()]// can generate error because i have correct her in avai-classroom(planning)
            }
            // console.log(teachersOfTheSubject)
            if (!newOccupiedTeachers.length) {
                return res.status(200).json(teachers)
            } else {
                console.log(2232)
                return res.status(200).json(teachers.filter((element) => newOccupiedTeachers.indexOf(element?._id?.toString()) === -1))
            }
        }
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}




function addDays(dateString, numDays) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + numDays);
    return date.toISOString();
}

function addMinutes(dateString, numMinutes) {
    const date = new Date(dateString);
    date.setTime(date.getTime() + numMinutes * 60000);
    return date.toISOString();
}

function resetTimeToMidnight(dateString) {
    const date = new Date(dateString);
    date.setUTCHours(0, 0, 0, 0);
    return date.toISOString();
}