const { Types, default: mongoose } = require("mongoose")
const Teacher = require("../models/Users/teacher.model")
const Student = require("../models/Users/student.model")
const DeclarationAbsence = require("../models/declarationAbsence.model")
const multer = require("multer")
const { notify } = require("../functions/Notify")
const jwt = require("jsonwebtoken")


exports.create = async (req, res) => {
    try {
        const { dateDeb, dateFin, description, studentId, teacherId, active } = req.body
        if (!dateDeb || !dateFin || dateDeb === "undefined") {
            return res.status(400).json({
                error: "Bad Request"
            })
        }
        console.log(req.body)
        // var notificationData = {}
        // const decodedToken = await jwt.verify(req.cookies.tck, process.env.TOKEN_KEY)
        // if (decodedToken) {
        //     var finalRole = ["owner", "admin", "super"].includes(decodedToken.role) ? "Admin" : "Teacher"
        //     var senderId = decodedToken._id
        //     var firstName = decodedToken.firstName
        //     var lastName = decodedToken.lastName
        // } else {
        //     res.clearCookie('tck')
        //     return res.status(403).json({
        //         "name": "NoTokenProvided"
        //     })
        // }
        const declarationAbsence = await DeclarationAbsence.create({
            student: studentId || null,
            teacher: teacherId || null,
            dateDeb: dateDeb,
            dateFin: dateFin,
            description: description,
            file: req.file ? { name: req.file.filename, path: req.file.path } : null,
        })
        await declarationAbsence.save()
        if (!declarationAbsence) {
            return res.status(400).send({
                message: "Some error occured while creating the absence"
            })
        }
        // try {
        //     notificationData = {
        //         ...notificationData,
        //         object: "Absence d'enseignant: " + firstName.toUpperCase() + " " + lastName.toUpperCase(),
        //         subject: `L'enseignant ${firstName} ${lastName} sera absent à partir de le date: ${dateDeb} jusqu'a le date: ${dateFin}`,
        //         sender: { senderPath: finalRole, senderId: senderId },



        //     }
        // } catch (e) {
        //     console.log(e)
        // }
        return res.status(201).send({
            created: true,
            declarationAbsence
        })
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: e.message,
            message: "Server error!"
        })
    }
}

exports.deleteDeclarationAbsence = async (req, res) => {
    try {
        const { idAbsence } = req.params
        if (!idAbsence) {
            return res.status(400).send({
                error: "Bad Request"
            })
        }
        const deletedAbsence = await DeclarationAbsence.findByIdAndDelete(Types.ObjectId(idAbsence))
        if (!deletedAbsence) {
            return res.status(404).send({
                error: "Not Found!",
                message: "Declared Absence with id: " + idAbsence + " Not found!"
            })
        }
        return res.status(200).send({
            deleted: true
        })
    } catch (e) {
        return res.status(500).send({
            error: e.message,
            message: "Server errror"
        })
    }
}

exports.changeAbsenceStatus = async (req, res) => {
    try {
        const { idAbsence } = req.params
        if (!idAbsence) {
            return res.status(400).send({
                error: "Bad Request"
            })
        }
        const updatedAbsence = await DeclarationAbsence.findById(Types.ObjectId(idAbsence))
        if (!updatedAbsence) {
            return res.status(404).send({
                error: "Not Found",
                message: "Declared Absence with id: " + idAbsence + " Not found!"
            })
        }
        updatedAbsence.active = !updatedAbsence.active
        await updatedAbsence.save()
        return res.status(200).send({
            updated: true,
            updatedAbsence
        })
    } catch (e) {
        return res.status(500).send({
            error: e.message,
            message: "Server Error"
        })
    }
}