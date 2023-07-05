const Evennement = require("../models/evennement.model")
const Session = require("../models/session.model")
const Section = require("../models/section.model")
const Semester = require("../models/semester.model")
const CollegeYear = require("../models/collegeYear.model")
const Group = require("../models/group.model")
const Teacher = require("../models/Users/teacher.model")
const Classroom = require("../models/classroom.model")
const Planning = require("../models/Planning.model")
const Student = require("../models/Users/student.model")
const Subject = require("../models/subject.model")
const { Types } = require("mongoose")
const { notify } = require("../functions/Notify")
const { logData } = require("../functions/logging")



exports.createEvent = async (req,res) => {
    try{
        const { 
            eventName,
            teachersParticipant, 
            studentsParticipant, 
            adminsParticipant, 
            day,
            startsAt, 
            endsAt, 
            week,
            classroom,
            dateDebPlanning, 
            idPlanning,
            semesterId, 
            collegeYearId,
            otherGroups
        } = req.body
        if (!day || !startsAt || !endsAt || !eventName || !week || !dateDebPlanning || !semesterId || !collegeYearId || !otherGroups || !otherSections || !idPlanning){
            return res.status(400).send({
                message:  "Bad Request"
            })
        }
        var starting_date_planning = new Date(dateDebPlanning)
        var realDay = day === 0 ? 7 : day
        var event_starting_day = addDays(starting_date_planning, Number(realDay - 1))
        var event_starting_resetedTomidNight = resetTimeToMidnight(event_starting_day)
        var event_ending_day = event_starting_resetedTomidNight
        var event_final_starting_date = addMinutes(event_starting_resetedTomidNight, Number(startsAt))
        var event_final_ending_date = addMinutes(event_ending_day, Number(endsAt))
        const event = await Evennement.create({
            eventName: eventName,
            collegeYear: collegeYearId,
            semester: semesterId,
            beginDate: new Date(event_final_starting_date),
            endingDate: new Date(event_final_ending_date),
            teachersParticipant: teachersParticipant,
            studentsParticipant: studentsParticipant,
            adminsParticipant: adminsParticipant,
        })
        await event.save()
        const planning = await Planning.findById(Types.ObjectId(idPlanning))
            .populate({ path: "group", populate: [{ path: "section" }, { path: "students", select: { password: 0 } }] })
            .populate({ path :"collegeYear", populate: { path: "semesters"}})
            .populate({ path: "sessions", populate: [{ path: "teacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "group", populate: [{ path: "students", select: { password: 0 } }, { path: "section" }] }, { path: "subTeacher", select: { password: 0 }, populate: { path: "subjects", select: { image: 0 } } }, { path: "subject" }, { path: "classroom" }] })
        if(planning){
            const session = await Session.create({
                classroom: req.body?.classroom ? classroom : null,
                group: Types.ObjectId(planning.group),
                day: Number(day),
                startsAt: Number(startsAt),
                endsAt: Number(endsAt),
                sessionType: "EVENT",
                event: event._id,
                initialSubGroup: "All",
                sessionCategorie: "Planning"
            })
            await session.save()
            planning.sessions.push(session._id)
            await planning.save()
            for( let i=0 ; i<otherGroups.length; i++){
                const tmpPlanning = await Planning.findOne({ week: Number(week), collegeYear: Types.ObjectId(collegeYearId), group: Types.ObjectId(otherGroups[i]) })
                if(tmpPlanning){
                    const tmpSession = await Session.create({
                        classroom: req.body?.classroom ? classroom : null,
                        group: Types.ObjectId(otherGroups[i]),
                        day: Number(day),
                        startsAt: Number(startsAt),
                        endsAt: Number(endsAt),
                        sessionType: "EVENT",
                        event: event._id,
                        initialSubGroup: "All",
                        sessionCategorie: "Planning"
                    })
                    await tmpSession.save()
                    tmpPlanning.sessions.push(tmpSession)
                    await tmpPlanning.save()
                }
            }
            return res.status(200).send({
                created: true,
                planning
            })
        }else{
            return res.status(404).send({
                message: "Planning with id: " +idPlanning+ " Not Found"
            })
        }
    }catch(e){
        return res.status(500).send({
            error : e.message,
            message: "Server Error"
        })
    }
}

exports.updateSessionEvent = async (req,res) => {
    try{
        const { idSession, day, startsAt, endsAt, classroom } = req.params
        if (!idSession){
            return res.status(400).send({
                message: "Bad Request"
            })
        }
        const session = await Session.findById(Types.ObjectId(idSession))
        if(session){
            if( Number(session.day) != Number(day) || Number(startsAt) != Number(session.startsAt) || Number(endsAt) != Number(session.endsAt) || classroom != session.classroom){
                session.day = Number(day)
                session.startsAt = Number(startsAt)
                session.endsAt = Number(endsAt)
                session.classroom = req.params?.classroom ? Types.ObjectId(classroom) : session.classroom
                await session.save()
            }
            return res.status(200).send({
                session,
                updated: true
            })
        }else{
            return res.status(404).send({
                message: "Session with id: " +idSession+ " Not Found"
            })
        }
    }catch(e){
        return res.status(500).send({
            message: "Server Error",
            error: e.message
        })
    }
}


exports.deleteEvent = async (req,res) => {
    const { idSession } = req.params
    try{
        if(!idSession){
            return res.status(400).send({
                message: "Bad Request"
            })
        } 
        const session = await Session.findByIdAndDelete(Types.ObjectId(idSession))
        if (session){
            return res.status(200).send({
                deleted: true
            })
        }else{
            return res.status(404).send({
                message: "Session with id: " +idSession+ " Not Found"
            })
        }
    }catch(e){
        return res.status(500).send({
            error : e.message,
            message: "Server Error" 
        })
    }
}