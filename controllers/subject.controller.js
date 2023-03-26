const { default: mongoose } = require('mongoose')
const { Subject } = require('../models/subject.model')
const Section = require('../models/section.model')
const TeacherModel = require("../models/Users/teacher.model");
const Session = require("../models/session.model")
const Template = require("../models/template.model")
const { Types } = require("mongoose")



//need update
//Create a new Subject
exports.createSubject = async (req, res) => {
    try {
        const { subjectName, active, description, image } = req.body
        if (!subjectName) {
            return res.status(400).send({
                error: "Bad Request!"
            })
        }
        const subject = new Subject({
            subjectName,
            description: description || null,
            active,
            image: image || null
        })
        subject.save().then(data => {
            res.status(201).send(data)
        }).catch(err => {
            if (err instanceof mongoose.Error.ValidationError) {
                const errorMessages = []
                for (let path in err.errors) {
                    if (err.errors.hasOwnProperty(path)) {
                        errorMessages.push(err.errors[path].message)
                    }
                }
                return res.status(400).send({
                    error: errorMessages.join(', ')
                })
            }
            if (err.keyValue?.subjectName) {
                return res.status(409).send({
                    error: "Bad Credentials!",
                    message: "Subject allready exists!"
                })
            }
            return res.status(400).send({
                error: err.message,
                message: "Some error occured while creating the subject!"
            })
        })
    } catch (e) {
        return res.status(500).send({
            error: e.message,
            message: "Server error!"
        })

    }
}


//get All subjects
exports.findAllSubjects = (req, res) => {
    try {
        Subject.find({}).then(subjects => {
            if (subjects.length === 0) {
                return res.status(204).send({
                    message: "There is no subjects in the database!",
                    found: false
                })
            }
            return res.status(200).send({
                subjects,
                found: true
            })
        }).catch(err => {
            return res.status(400).send({
                error: err.message,
                message: "Some error occured while retrieving all subjects!"
            })
        })
    } catch (e) {
        return res.status(500).send({
            error: e.message,
            message: "Server error!"
        })
    }
}



exports.findAllSubjectsWithTeachers = (req, res) => {
    try {
        Subject.find({}).populate({ path: "teachers", select: { image: 1, firstName: 1, lastName: 1 } }).then(subjects => {
            if (subjects.length === 0) {
                return res.status(204).send({
                    message: "There is no subjects in the database!",
                    found: false
                })
            }
            return res.status(200).send({
                subjects,
                found: true
            })
        }).catch(err => {
            return res.status(400).send({
                error: err.message,
                message: "Some error occured while retrieving all subjects!"
            })
        })
    } catch (e) {
        return res.status(500).send({
            error: e.message,
            message: "Server error!"
        })
    }
}


// find subject by Name
exports.findSubjectByName = (req, res) => {
    try {
        const { subjectName } = req.params
        if (!subjectName) {
            return res.status(500).send({
                error: "Bad Request!"
            })
        }
        Subject.findOne({ subjectName }).then(subject => {
            if (!subject) {
                return res.status(404).send({
                    message: "Subject with the following name " + subjectName + " not found!",
                    found: false
                })
            }
            return res.status(200).send({
                subject,
                found: true
            })
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    error: "There is no subject with the name" + subjectName + " in database!",
                })
            }
            return res.status(400).send({
                error: err.message,
                message: "Some error occured while finding the subject with the name" + subjectName
            })
        })
    } catch (e) {
        return res.status(500).send({
            error: e.message,
            message: "Server error!"
        })
    }
}

//update subject 
exports.updateSubject = async (req, res) => {
    try {
        const subjectId = req.params.subjectId
        if (!subjectId) {
            return res.status(500).send({
                error: "Bad Request!"
            })
        }
        Subject.findByIdAndUpdate(subjectId, req.body, { new: true, runValidators: true }).then(subject => {
            if (!subject) {
                return res.status(404).send({
                    message: "Subject with id : " + subjectName + " Not found!",
                    updated: false
                })
            }
            console.log(subject)
            return res.status(200).send({
                subject,
                updated: true
            })
        }).catch(err => {
            return res.status(400).send({
                error: err.message,
                message: "Some error occured while updating the subject with id " + subjectId
            })
        })
    } catch (e) {
        if (e.keyValue?.subjectName) {
            return res.status(409).send({
                error: "Bad Credentials!",
                message: "Subject allready exists!"
            })
        }
        return res.status(500).send({
            error: e.message,
            message: "Server error!"
        })
    }
}

//delete a subject
exports.deleteSubject = (req, res) => {
    try {
        const { subjectId } = req.params
        if (!subjectId) {
            return res.status(400).send({
                error: "Bad Request!"
            })
        }
        Subject.findByIdAndDelete(subjectId).then((subject) => {
            if (!subject) {
                return res.status(404).send({
                    message: "Subject with id " + subjectId + "Not found!",
                    deleted: false
                })
            }
            subject.teachers.forEach(async (teacher, index) => {
                await TeacherModel.findByIdAndUpdate(teacher[index], { $pull: { $subjects: subject._id } }, { runValidators: true, new: true })
            })
            return res.status(200).send({
                message: "Subject with the id " + subjectId + " Successfully deleted",
                deleted: true
            })
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    error: "Subject with the id " + subjectId + "not found!"
                })
            }
            return res.status(400).send({
                error: err.message,
                message: "Some error occured while deleting the subject with id " + subjectId
            })
        })
    } catch (e) {
        return res.status(500).send({
            error: e.message,
            message: "Server error!"
        })
    }
}

// activate or disactivate a subject from a section
exports.changeSubjectState = (req, res) => {
    try {
        const { subjectName, sectionName, active } = req.body
        if (!subjectName || !sectionName || active === undefined) {
            return res.status(400).send({
                error: "Bad Request!"
            })
        }
        Subject.findOneAndUpdate({ subjectName: subjectName, 'properties.sectionName': sectionName }, { $set: { 'properties.$.active': active } }, { new: true, runValidators: true }).then(subject => {
            if (!subject) {
                return res.status(404).send({
                    error: "Please verify that the Subject " + subjectName + " exists or that the Section " + sectionName + " includes into the Subject ",
                    updated: false
                })
            }
            return res.status(200).send({
                subject,
                updated: true
            })
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    error: err.message,
                    message: "Subject " + subjectName + " not found! or the Section " + sectionName + " does not include the Subject"
                })
            }
            return res.status(400).send({
                error: err.message,
                message: "Some error occured while changing the subject state!!"
            })
        })
    } catch (e) {
        return res.status(500).send({
            error: e.message,
            message: "Server error!"
        })
    }
}

// [
//     {
//         sessions : [
//             {
//             teacherName : 
//             teacherId ; 
//             },
//             {


//             },
//         {

//         },
//         {

//         }
    
//         ]
//     },
//     {

//     },
//     {

//     },
//     {

//     }
// ]


//available teachers  => returns object.teachers to acced the teachers availalbe
//need test after filling one session in planning
exports.findAvailableTeachers = async (req, res) => {
    try {
        const subjectId = req.params.subjectId
        const { startsAt, endsAt, day, collegeYear } = req.body
        if (!startsAt || !endsAt || !day || !collegeYear || !subjectId) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        var teachersOfTheSubject = await Subject.findById(subjectId, 'subjectName teachers').populate({ path: "teachers", select: { image: 0, note: 0, birth: 0, maritalStatus: 0, password: 0 } })
        console.log(teachersOfTheSubject)
        if (!teachersOfTheSubject) {
            return res.status(204).send({
                error: "EmptyDataBase",
                message: "There is no Teachers in Data base"
            })
        } else {
            teachersOfTheSubject = teachersOfTheSubject.teachers
            var OccupiedTeachers = await Template.find({ collegeYear: collegeYear }, 'sessions')
                .populate({ path: "sessions", match: { subject: subjectId, startsAt: startsAt, endsAt: endsAt, day: day } })
            OccupiedTeachers = OccupiedTeachers?.filter((element) => Array.isArray(element.sessions)).reduce((a, b, index) => index !== 1 ? [...a, ...b.sessions] : [...a.sessions, b.sessions]).map((element) => element.teacher) || []
            if (!OccupiedTeachers.length) {
                return res.status(200).json(teachersOfTheSubject)
            } else {
                return res.status(200).json(teachersOfTheSubject.filter((element) => OccupiedTeachers.indexOf(element._id) === -1))
            }
        }
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error"
        })
    }
}


