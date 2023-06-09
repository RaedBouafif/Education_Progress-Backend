const sectionModel = require('../models/section.model')
const Section = require('../models/section.model')
const { Subject } = require('../models/subject.model')
const { Types } = require('mongoose')
const groupModel = require("../models/group.model")
const sessionModel = require("../models/session.model")
const { logData } = require("../functions/logging")


//create a new section
exports.createSection = async (req, res) => {
    try {
        console.log(req.body)
        if (!req.body.sectionName) {
            return res.status(400).send({
                error: "Bad Request!"
            })
        }
        var section = await Section.create({
            sectionName: req.body.sectionName,
            subjects: req?.body?.subjects?.split(',') || null
        })
        section = await Section.populate(section, { path : "subjects"})
        section.save().then(data => {
            try{
                logData({ modelId: data._id, modelPath: "Section", action: "Created section: " +data._id.toString()})
            }catch(e){
                console.log(e.message)
            }
            res.status(201).send(data)
        }).catch(err => {
            return res.status(400).send({
                error: err.message,
                message: "Some error occured while creating the section"
            })
        })
    } catch (e) {
        if (e.keyValue?.sectionName) {
            return res.status(409).send({
                error: "BadCredentials",
                message: "Section with name " + req.body.sectionName + " allready exists!"
            })
        }
        if (e.code === 11000) {
            return res.status(409).send({
                error: "BadRequest",
                message: "Section with name " + req.body.sectionName + " allready exists!"
            })
        }
        return res.status(500).send({
            error: "Server ERROR!"
        })
    }
}

// get All sections
exports.findAllSections = (req, res) => {
    try {
        Section.find({}).populate("subjects").then(sections => {
            if (!sections) {
                return res.status(204).send({
                    message: "There is no Sections in the database!!",
                    found: false
                })
            }
            return res.status(200).send({
                sections,
                found: true
            })
        }).catch(err => {
            return res.status(400).send({
                error: err.message,
                message: "Some Error occured while getting all the Sections"
            })
        })
    } catch (e) {
        return res.status(500).send(({
            error: e.message,
            message: "Server ERROR!"
        }))
    }
}

// get One Section by SectionName
exports.findSectionByName = (req, res) => {
    try {
        const { sectionName } = req.params
        if (!sectionName) {
            return res.status(400).send({
                error: "Bad Request!",
                message: "SectionName Required!"
            })
        }
        Section.findOne({ sectionName }).then(section => {
            if (!section) {
                return res.status(404).send({
                    error: "Section with the following name " + sectionName + " Not Found!!",
                    found: false
                })
            }
            return res.status(200).send({
                section,
                found: true
            })
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    error: "Section with the following name " + sectionName + " Not Found!!",
                })
            }
            return res.status(400).send({
                error: err.message,
                message: "Some Error occured while finding the Section with name " + sectionName
            })
        })
    } catch (e) {
        return res.status(500).send({
            error: e.message,
            message: "Server ERROR!"
        })
    }
}

// change Section State (activate or disactivate)
exports.changeSectionState = (req, res) => {
    try {
        const { sectionName } = req.params
        if (!sectionName || req.body.active === undefined) {
            return res.status(400).send({
                error: "Bad Request!",
            })
        }
        Section.findOneAndUpdate({ sectionName: sectionName }, req.body, { new: true, runValidators: true }).then(section => {
            if (!section) {
                return res.status(404).send({
                    message: "Section with name " + sectionName + " Not Found!!",
                    updated: false
                })
            }
            try{
                logData( {modelId: section._id, modelPath: "Section", action: "Activated/Disactivated section: " +section._id.toString()})
            }catch(e){
                console.log(e.message)
            }
            return res.status(200).send({
                section,
                updated: true
            })
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    error: "Section with name " + sectionName + " Not Found!!",
                })
            }
            return res.status(400).send({
                error: err.message,
                message: "Some Error occured while updating the Section with name " + sectionName
            })
        })
    } catch (e) {
        return res.status(500).send({
            error: e.message,
            message: "Server ERROR!"
        })
    }
}


exports.deleteById = async (req, res) => {
    try {
        const { sectionId } = req.params
        const section = await sectionModel.findByIdAndDelete(sectionId)
        if (section) {
            const groups = (await groupModel.find({ section: section._id }))?.map((element) => element._id)
            await groupModel.deleteMany({ section: section._id })
            await sessionModel.deleteMany({ group: { $in: groups } })
            try{
                logData( {modelId: Types.ObjectId(sectionId), modelPath: "Section", action: "Deleting section: " +sectionId})
            }catch(e){
                console.log(e.message)
            }
            return res.status(200).json({
                found: true, section
            });
        }

        else
            return res.status(404).json({
                found: false,
            });
    } catch (e) {
        return res.status(500).json({
            error: "serverSideError"
        })
    }
}

// add a Subject to the section
exports.addSubject = async (req, res) => {
    try {
        var sectionName = req.params.sectionName
        var subjectId = req.params.subjectId
        if (!sectionName || !subjectId) {
            return res.status(400).send({
                error: "Bad Request!"
            })
        }
        const section = await Section.findOne({ sectionName })
        if (!section) {
            return res.status(404).send({
                message: "Section with name " + sectionName + " Not Found!",
                sectionFound: false,
                subjectAdded: false
            })
        }
        const subject = await Subject.findById(subjectId)
        if (!subject) {
            return res.status(404).send({
                message: "Subject with id " + subjectId + " Not Found!",
                subjectFound: false,
                subjectAdded: false
            })
        }
        if (section.subjects.length !== 0) {
            let subjectExist = false
            for (let i = 0; i < section.subjects.length; i++) {
                if (section.subjects[i].toString() === subjectId) {
                    subjectExist = true
                    break
                }
            }
            if (subjectExist) {
                return res.status(409).send({
                    message: "Subject allready exists in the Section " + sectionName,
                    subjectAdded: false
                })
            } else {
                section.subjects.push(subjectId)
                section.save().then(data => {
                    try{
                        logData( {modelId: Types.ObjectId(data._id), modelPath: "Section", secondModelId: subject._id, secondModelType: "Subject", action: "Adding subject: " +subject._id.toString()+ " to Section: " +data._id.toString() })
                    }catch(e){
                        console.log(e.message)
                    }
                    return res.status(201).send({
                        data,
                        subjectAdded: true
                    })
                }).catch(err => {
                    return res.status(400).send({
                        error: err.message,
                        message: "Some Error occured while adding the subject " + subject.subjectName + " to the Section " + sectionName
                    })
                })
            }
        } else {
            // the section.subjects is empty so we add the subject
            section.subjects.push(subjectId)
            section.save().then(data => {
                return res.status(201).send({
                    data,
                    subjectAdded: true
                })
            }).catch(err => {
                return res.status(400).send({
                    error: err.message,
                    message: "Some Error occured while adding the subject " + subject.subjectName + " to the Section " + sectionName
                })
            })
        }
    } catch (e) {
        if (e.kind === 'ObjectId' || e.name === 'NotFound') {
            return res.status(404).send({
                error: "Subject with id " + subjectId + " Not Found!"
            })
        }
        if (e.keyValue?.sectionName) {
            return res.status(409).send({
                error: "Conflict SectionName",
                message: "Section allready exists"
            })
        }
        if (e.keyValue?.subjectId) {
            return res.status(409).send({
                error: "Conflict SubjectId",
                message: "Subject allready exists into the Section" + sectionName
            })
        }
        return res.status(500).send({
            error: e.message,
            message: "Server ERROR!"
        })
    }
}

// Remove subject from a section
exports.removeSubject = async (req, res) => {
    try {
        const sectionName = req.params.sectionName
        const subjectId = req.params.subjectId
        if (!sectionName || !subjectId) {
            return res.status(400).send({
                error: "Bad Request!"
            })
        }
        const section = await Section.findOne({ sectionName })
        if (!section) {
            return res.status(404).send({
                message: " Section with name " + sectionName + " Not Found!",
                subjectRemoved: false
            })
        }
        if (section.subjects.length !== 0) {
            tempSubjects = section.subjects
            const filteredSubjects = tempSubjects.filter((element) => element.toString() !== subjectId)
            if (tempSubjects.length !== filteredSubjects.length) {
                section.subjects = filteredSubjects
                section.save().then(data => {
                    try{
                        logData( {modelId: Types.ObjectId(data._id), modelPath: "Section", secondModelId: Types.ObjectId(subjectId), secondModelType: "Subject", action: "Removing subject: " +subjectId+ " from Section: " +data._id.toString() })
                    }catch(e){
                        console.log(e.message)
                    }
                    return res.status(201).send({
                        section,
                        subjectRemoved: true
                    })
                }).catch(err => {
                    return res.status(400).send({
                        error: err.message,
                        message: "Some error occured while Removing the subject with Id " + subjectId + " From the Section " + sectionName
                    })
                })
            } else {
                return res.status(404).send({
                    message: "Subject with id " + subjectId + " Does not exist in the Section " + sectionName,
                    subjectRemoved: false,
                    subjectFound: false
                })
            }
        } else {
            return res.status(400).send({
                message: "Section " + sectionName + " does not have any subject!",
                subjectRemoved: false,
                subjectFound: false
            })
        }
    } catch (e) {
        if (e.keyValue?.sectionName) {
            return res.status(409).send({
                error: "Conflict SectionName",
                message: "Section allready exists"
            })
        }
        return res.status(500).send({
            error: e.message,
            message: "Server ERROR!"
        })
    }
}


//Update section
exports.updateSection = async (req, res) => {

    try {
        if (!req.params.sectionId) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        if (!req.body) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        if (req.body.subjects) {
            req.body.subjects = req.body.subjects?.split(",")
        }
        else {
            req.body.subjects = null
        }
        const updatedSection = await Section.findByIdAndUpdate(req.params.sectionId, req.body, { new: true, runValidators: true }).populate("subjects")
        if (!updatedSection) {
            return res.status(404).send({
                error: "NotFound"
            })
        }
        try{
            logData( {modelId: updatedSection._id, modelPath: "Section", action: "Updated subject: " +updatedSection._id.toString()})
        }catch(e){
            console.log(e.message)
        }
        return res.status(200).json(
            updatedSection
        )
    } catch (e) {
        console.log(e)
        if (e.keyValue?.sectionName) {
            return res.status(409).send({
                error: "BadCredentials",
                message: "Section with name " + req.body.sectionName + " allready exists!"
            })
        }
        return res.status(500).send({
            error: e.message,
            message: "Server Error!"
        })
    }
}