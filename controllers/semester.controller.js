const SemesterModel = require("../models/semester.model")
const { logData } = require("../functions/logging")


exports.create = async (req, res) => {
    try {
        const semester1 = await SemesterModel.create(req.body.semester1)
        const semester2 = await SemesterModel.create(req.body.semester2)
        return res.status(201).json(
            {   semester1,
                semester2
        })
    } catch (e) {
        console.log(e)
        if (e.keyValue?.dateBegin)
            return res.status(409).json({
                error: "semesterConflict",
                message: "semester already exist"
            })
        else if (e.errors?.name || e.errors?.dateBegin || e.errors?.dateBegin || e.errors?.coefficient)
            return res.status(400).json({
                error: "badRequest"
            })
        else return res.status(500).json({
            error: "serverSideError"
        })
    }
}

exports.getAll = async (req, res) => {
    try {
        const semesters = await SemesterModel.find(req.body)
        return semesters.length
            ? res.status(200).json({ found: true, semesters })
            : res.status(204).json({ found: false })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            error: "serverSideError"
        })
    }
}

exports.update = async (req, res) => {
    try {
        const { semesterId } = req.params
        const semester = await SemesterModel.findByIdAndUpdate(semesterId, req.body, { runValidators: true, new: true })
        return semester ? res.status(200).json({ found: true, semester }) : res.status(404).json({ found: false })
    } catch (e) {
        if (e.keyValue?.dateBegin)
            return res.status(409).json({
                error: "semesterConflict",
                message: "semester already exist"
            })
        else if (e.errors?.name || e.errors?.dateBegin || e.errors?.dateBegin || e.errors?.coefficient)
            return res.status(400).json({
                error: "badRequest"
            })
        else return res.status(500).json({
            error: "serverSideError"
        })
    }
}