const Planning = require("../models/Planning.model")
const Session = require("../models/session.model")
const section = require("../models/section.model")
const Semester = require("../models/semester.model")


exports.createInitialTemplate = async (req,res) => {
    // l faza mta3 group else 3ana awel mara l group 3a ya9ra
    try {
        var tempSessions = await Session.getDistinctLatest(req.body.group , "template") 
        console.log(tempSessions)
        if(tempSessions.length !== 0){
            return res.status(201).json(tempSessions)
        }   
        else {
            const sessionTemplate = await Session.create(req.body.sessions)
            for(s of sessionTemplate){
                await s.save()
            }
            return res.status(201).json(sessionTemplate)
        }
    }catch(e) {
        console.log(e)
        return res.status(500).send({
            error : e.message,
            message : "Server ERROR!"
        })
    }
}



exports.createOneSession = async (req,res) => {
try{
    const sessionTemplate = await Session.create(req.body.sessions)
    for(s of sessionTemplate){
        await s.save()
    }
    return res.status(201).json(sessionTemplate)
}catch(e) {
    return res.status(500).send({
        error : e.message,
        message : "Server ERROR!"
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



//get template of last year of the group ** for semester **  and modify else create new one  

/**get template service by group and semester (if semester is unique for every year 
or we should add the year to select the right one )**/

exports.getTemplate = async (req, res) => {
    try {

    } catch (e) {

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
