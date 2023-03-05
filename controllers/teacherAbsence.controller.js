const TeacherAbsence = require("../models/teacherAbsence.model")
const Teacher = require("../models/Users/teacher.model")
const Session = require("../models/session.model")
const e = require("cors")

exports.saveAbsence = async (req,res) => {
    try{
        const { session , teacher } = req.body
        const absence = await TeacherAbsence.create(
            {
                teacher : teacher,
                session : session,
            }
        )
        absence.save().then( data => {
            return res.status(201).send({
                saved : true,
                data
            })
        }).catch( err => {
            if (err.kind == 'ObjectId' || err.name == 'NotFound'){
                return res.status(404).send({
                    error : "Teacher with id : " +teacher+ " or Session with id : " +session+ " Not Found!",
                    saved : false
                })
            }
            return res.status(400).send({
                error : err.message,
                message : "Some Error occured while saving the Teacher Absence"
            })
        })

    }catch(e) {
        if (e.code == "11000"){
            return res.status(400).send({
                error : "Absence allready exists , we cannot insert it"
            })
        }
        return res.status(500).send({
            error : e.message,
            message : "Server ERROR!"
        })
    }
}

// get all Teachers absences from DataBase by year
exports.getAllTeachersAbsences = async (req,res) => {
    try{
        const absences = await TeacherAbsence.findAll({
            $where : () => {return this.date.getFullYear() === req.params.year}
        })
        return absences ?
            res.status(200).send({
                found: true,
                absences
            })
            :
            res.status(204).send({
                found : false,
                message : "There is no Absences saved in the dataBase"
            })
    }catch (e) {
        return res.status(500).send({
            error : e.message,
            message : "Server ERROR!"
        })
    }
}

// get all Teacher Absences by teacherId
exports.getTeacherAbsences = async (req,res) => {
    try{
        const teacherId = req.params.teacherId
        const absences = await TeacherAbsence.find({ teacher : teacherId})
        return absences ?
            res.status(200).send({
                found : true,
                absences
            })
            :
            res.status(404).send({
                found : false,
                message : "Teacher with id " +teacherId+ " Not Found!"
            })
    }catch(e) {
        return res.status(500).send({
            error : e.message,
            message : "Server ERROR!"
        })
    }
}



// get all Teacher Absences by teacherId and year
exports.getTeacherAbsencesByYear = async (req,res) => {
    try{
        const teacherId = req.params.teacherId
        const year = req.params.year
        const absences = await TeacherAbsence.find(
            {
                teacher : teacherId,
                $where : () => { return this.date.getFullYear() === year}
            })
        return absences ?
            res.status(200).send({
                found : true,
                absences
            })
            :
            res.status(404).send({
                found : false,
                message : "Teacher with id " +teacherId+ " Not Found!"
            })
    }catch(e) {
        return res.status(500).send({
            error : e.message,
            message : "Server ERROR!"
        })
    }
}

// get all Teacher Absences by teacherId and semester
exports.getTeacherAbsencesByYear = async (req,res) => {
    try{
        const absences = await TeacherAbsence.find(
            {
                teacher : req.body.teacher,
                createdAt : { $gte : new Date(req.body.dateBegin) , $lte : new Date(req.body.dateEnd)}
            })
        return absences ?
            res.status(200).send({
                found : true,
                absences
            })
            :
            res.status(404).send({
                found : false,
                message : "Teacher with id " +teacherId+ " Not Found!"
            })
    }catch(e) {
        return res.status(500).send({
            error : e.message,
            message : "Server ERROR!"
        })
    }
}

// Update the Absence and made it justified
exports.justifyAbsence = async (req,res) => {
    try{
        const absenceId = req.params.absenceId
        const updatedAbsence = await TeacherAbsence.findByIdAndUpdate(absenceId , { justified : true }, {new : true , runValidators : true})
        return updatedAbsence ?
            res.status(200).send({
                updated : true,
                updatedAbsence
            })
            :
            res.status(404).send({
                updated : false,
                message : "There is no TeacherAbsence with id : " +absenceId
            })
    }catch (e) {
        if (e.kind === 'ObjectId' || e.name === 'NotFound'){
            return res.status(404).send({
                error : "NotFound",
                message : "There is no Teacher absence with the given id : "+absenceId
            })
        }
        return res.status(500).send({
            error : e.message,
            message: "Server ERROR!"
        })
    }
} 