

const PlanningModel = require("../models/Planning.model")
const Session = require("../models/session.model")
const section = require("../models/section.model")
const { restart } = require("nodemon")


exports.create = async (req, res) => {
    try {
        const planning = await PlanningModel.create(req.body)
        await planning.save()
        return res.status(201).json(planning)
    } catch (e) {
        console.log(e)
        if (e.code === 11000) {
            return res.status(409).json({
                error: "conflictPlanning",
                message: "week and group combination are already used"
            })
        }
        if (e.errors?.week?.properties) return res.status(400).json({
            error: e.errors.week.properties.message
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
        const plannings = await PlanningModel.find(req.body)
            .populate({ path: "sessions" })
            .populate({ path: "group", populate: { path: "section" } })
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
        const planning = await PlanningModel.findById(planningId)
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


exports.deleteById = async (req, res) => {
    try {
        const { planningId } = req.params
        const planning = await PlanningModel.findByIdAndRemove(planningId)
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
        const planning = await PlanningModel.findByIdAndUpdate(req.params.planningId, req.body, {
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
                message: "week and group combination are already used"
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
