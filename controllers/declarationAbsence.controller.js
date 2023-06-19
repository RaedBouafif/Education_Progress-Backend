const { Types, default: mongoose } = require("mongoose")
const Teacher = require("../models/Users/teacher.model")
const Student = require("../models/Users/student.model")
const DeclarationAbsence = require("../models/declarationAbsence.model")
const multer = require("multer")

exports.create = async (req,res) => {
    try{
        const { dateDeb, dateFin, category, description, studentId, teacherId, active } = req.body
        if ( !dateDeb || !dateFin || !category ){
            return res.status(400).send({
                error: "Bad Request"
            })
        }
        const declarationAbsence = await DeclarationAbsence.create({
            studentId: studentId || null,
            teacherId: teacherId || null,
            dateDeb: dateDeb,
            dateFin: dateFin,
            category: category,
            description: description,
            file: { name : req.file.filename, path: req.file.path } || null,
            active: active
        })
        await declarationAbsence.save()
        if (!declarationAbsence){
            return res.status(400).send({
                message: "Some error occured while creating the absence" 
            })
        }
        return res.status(201).send({
            created: true,
            declarationAbsence
        })
    }catch(e) {
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
        return res.status(500).send({
            error: e.message,
            message: "Server Error"
        })
    }
}