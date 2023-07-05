const Planning = require("../models/Planning.model")
const Section = require("../models/section.model")
const Semester = require("../models/semester.model")
const CollegeYear = require("../models/collegeYear.model")
const Group = require("../models/group.model")
const Teacher = require("../models/Users/teacher.model")
const { Subject } = require("../models/subject.model")
const Classroom = require("../models/classroom.model")
const LibraryExams = require("../models/libraryExams.model")
const Session = require("../models/session.model")
const Examen = require("../models/examen.model")
const { Types } = require("mongoose")
const { notify } = require("../functions/Notify")
const { logData } = require("../functions/logging")



exports.createLibraryExam = async (req, res) => {
    try {
        const { examenId, examCategory, title } = req.body
        if (!examenId || !examCategory || !req.file) {
            return res.status(400).send({
                message: "Bad Request"
            })
        }
        const examen = await Examen.findById(examenId)
        if (examen) {
            const libraryExam = await LibraryExams.create({
                title: (examCategory == "Correction" ? `Correction ${title}` : `Devoir ${examen.examTitle}`),
                examCategory: examCategory,
                examType: examen.examType,
                examNumber: examen.examNumber,
                subject: examen.subject,
                collegeYear: examen.collegeYear,
                semester: examen.semester,
                groups: examen.groups,
                file: { name: req.file?.originalname, path: req.file?.path }
            })
            await libraryExam.save()
            return (libraryExam) ? res.status(200).send({ created: true, libraryExam })
                : res.status(400).send({ created: false })
        } else {
            return res.status(404).send({
                message: "Examen with id: " + examenId + "Not Found"
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: e.message,
            message: "Server Error"
        })
    }
}
exports.getExam = async (req, res) => {
    try {
        const exam = await LibraryExams.findOne({})
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: e.message,
            message: "Server Error"
        })
    }
}
exports.findAllLibraries = async (req, res) => {
    try {
        const { examCategory, examType, subject, section, group, collegeYear, semester } = req.query
        var filter = {}
        if (examCategory) filter.examCategory = examCategory
        if (examType) filter.examType = examType
        if (subject) filter.subject = subject
        if (section) filter.section = section
        if (group) filter.group = group
        if (semester) filter.semester = semester
        if (collegeYear) filter.collegeYear = collegeYear
        const libraryExams = await LibraryExams.find(filter).sort({ createdAt: -1 })
        if (libraryExams) {
            return res.status(200).send(libraryExams)
        }
        return res.status(204).send({
            message: "There is no exams in the database"
        })
    } catch (e) {
        console.log(e.message)
        return res.status(500).send({
            error: e.message,
            message: "Server Error"
        })
    }
}