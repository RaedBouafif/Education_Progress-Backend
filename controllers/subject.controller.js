const Subject = require('../models/subject.model')


//need update
//Create a new Subject
exports.createSubject() = (req,res) => {
    try{
        const { subjectName, coefficient , active, sectionName} = req.body
        if (!subjectName || !coefficient || !sectionName){
            return res.status(400).send({
                error : "Bad Request!"
            })
        }
        const subject = new Subject({
            subjectName : subjectName || null,
            properties : {coefficient : coefficient, sectionName: sectionName} || null,
            active : active || null
        })
        subject.save().then( data => {
            res.status(201).send(data)
        }).catch(err => {
            if (err.keyValue?.subjectName){
                return res.status(409).send({
                    error : "Bad Credentials!",
                    message : "Subject allready exists!"
                })
            }else{
                return res.status(400).send({
                    error : err.message,
                    message : "Some error occured while creating the subject!"
                })
            }
        })
    }catch(e) {
        return res.status(500).send({
            error : e.message,
            message : "Server error!"
        })

    }
}


//need update
//get All subjects
exports.findAllSubjects = (req,res) => {
    try{
        Subject.find().then( subjects => {
            if(subjects.length == 0){
                return res.status(204).send({
                    message : "There is no subjects in the database!",
                    found : false
                })
            }
            return res.status(200).send({
                subjects,
                found : true
            })
        }).catch(err => {
                return res.status(400).send({
                error : err.message,
                message : "Some error occured while retrieving all subjects!"
            })
        })
    }catch(e) {
        return res.status(500).send({
            error : e.message,
            message : "Server error!"
        })
    }
}

// find subject by Name
exports.findSubjectByName() = (req,res) => {
    try{
        const { subjectName } = req.body
        if (!subjectName) {
            return res.status(500).send({
                error : "Bad Request!"
            })
        }
        Subject.findOne(subjectName).then( subject =>{
            if (subject.length ==0 ){
                return res.status(404).send({
                    message : "Subject with the following name " + subjectName + " not found!",
                    found : false
                })
            }
            return res.status(200).send({
                subject,
                found : true
            })
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound'){
                return res.status(404).send({
                    error : "There is no subject with the name" + subjectName + " in database!",
                })
            }
            return res.status(400).send({
                error : err.message,
                message : "Some error occured while finding the subject with the name" + subjectName
            })
        })
    }catch(e) {
        return res.status(500).send({
            error : e.message,
            message : "Server error!"
        })
    }
}