const { Types, default: mongoose } = require("mongoose")
const Teacher = require("../models/Users/teacher.model")
const Student = require("../models/Users/student.model")
const DeclarationAbsence = require("../models/declarationAbsence.model")
const multer = require("multer")
const { notify } = require("../functions/Notify")
const jwt = require("jsonwebtoken")


exports.create = async (req,res) => {
    try{
        console.log(req.body)
        const { dateDeb, dateFin, description, studentId, teacherId, active } = req.body
        if ( (!dateDeb && dateDeb != "undefined") || (!dateFin && dateFin != "undefined") ){
            return res.status(400).send({
                error: "Bad Request"
            })
        }
        var notificationData = {}
        var finalDateDeb = new Date(dateDeb)
        var finalDateFin = new Date(dateFin)
        const declarationAbsence = await DeclarationAbsence.create({
            studentId: studentId || null,
            teacherId: teacherId || null,
            dateDeb: finalDateDeb,
            dateFin: finalDateFin,
            description: description,
            file: { name : req.file?.originalname, path: req.file?.path } || null
        })
        await declarationAbsence.save()
        if (!declarationAbsence){
            return res.status(400).send({
                message: "Some error occured while creating the absence" 
            })
        }
        if (teacherId){
            const teacher= await Teacher.findById(teacherId)
            // try{
            //     notificationData = {
            //         ...notificationData,
            //         object: "Absence d'enseignant: " +teacher.firstName.toUpperCase()+" "+teacher.lastName.toUpperCase(),
            //         subject: `L'enseignant ${teacher.firstName} ${teacher.lastName} sera absent à partir de le date: ${dateDeb} jusqu'a le date: ${dateFin}`,
            //         sender: { senderPath: ["admin", "owner", "super"].includes(req.body.decodedToken.role) ? "Admin" : "Teacher" , senderId: req.body.decodedToken._id},
            //         // receivers: [{receiverId: absentUser, }]
    
    
    
            //     }
            // }catch(e){
            //     console.log(e)
            // }
        }else{
            const student= await Teacher.findById(studentId)
        }
        return res.status(201).send({
            created: true,
            declarationAbsence
        })
    }catch(e) {
        console.log(e)
        return res.status(500).send({
            error: e.message,
            message: "Server error!"
        })
    }
}

exports.deleteDeclarationAbsence = async (req,res) => {
    try{
        const { idAbsence } = req.params
        if (!idAbsence){
            return res.status(400).send({
                error : "Bad Request"
            })
        }
        const deletedAbsence = await DeclarationAbsence.findByIdAndDelete(Types.ObjectId(idAbsence))
        if (!deletedAbsence){
            return res.status(404).send({
                error : "Not Found!",
                message: "Declared Absence with id: " +idAbsence+ " Not found!"
            })
        } 
        return res.status(200).send({
            deleted: true
        })
    }catch(e){
        console.log(e)
        return res.status(500).send({
            error : e.message,
            message: "Server errror"
        })
    }
}

exports.changeAbsenceStatus = async (req,res) => {
    try{
        const { idAbsence } = req.params
        if (!idAbsence){
            return res.status(400).send({
                error: "Bad Request"
            })
        }
        const updatedAbsence = await DeclarationAbsence.findById(Types.ObjectId(idAbsence))
        if (!updatedAbsence){
            return res.status(404).send({
                error: "Not Found",
                message: "Declared Absence with id: " +idAbsence+ " Not found!"
            })
        }
        updatedAbsence.active = !updatedAbsence.active
        await updatedAbsence.save()
        return res.status(200).send({
            updated: true,
            updatedAbsence
        })
    }catch(e){
        console.log(e)
        return res.status(500).send({
            error: e.message,
            message: "Server Error"
        })
    }
}