const teacherAbsence = require('../models/teacherAbsence.model')
const Teacher = require('../models/Users/teacher.model')
const Session = require('../models/session.model')

// Save the teacher Absence
exports.createTeacherAbsence = (req,res) => {
    try {
        const { teacherId, sessionId } = req.body
        if (!teacherId || !sessionId){
            return res.status(400).send({
                error : "Bad Request!"
            })
        }
        const teacherAbsence = new teacherAbsence({
            
        })

    }catch(e) {
        return res.status(500).send({
            error : e.message,
            message : "Server ERROR!:"
        })
    }
}