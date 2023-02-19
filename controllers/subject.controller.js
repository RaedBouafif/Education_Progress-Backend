const { default: mongoose } = require('mongoose')
const {Subject} = require('../models/subject.model')
const Section = require('../models/section.model')


//need update
//Create a new Subject
exports.createSubject = async (req,res) => {
    try{
        const { subjectName , active, properties} = req.body
        if (!subjectName){
            return res.status(400).send({
                error : "Bad Request!"
            })
        }
        if(!properties){
            return res.status(400).send({
                error : "Bad Request!"
            })
        }
        for (let i =0 ; i< properties.length ; i++){
            let currentSectionName = properties[i].sectionName
                const section = await Section.findOne({sectionName : currentSectionName})
                if (!section){
                    return res.status(400).send({
                        error : "Section "+currentSectionName+ " cannot be inserted or updated"
                    })
                }
            for ( let j=i+1 ; j< properties.length ; j++){
                if (properties[i].sectionName == properties[j].sectionName){
                    return res.status(400).send({
                        error : "Can not insert a duplicated section in the same subject!"
                    })
                }
            }
        }
        const subject = new Subject({
            subjectName : subjectName || null,
            properties : properties || null,
            active : active
        })
        subject.save().then( data => {
            res.status(201).send(data)
        }).catch(err => {
            if (err instanceof mongoose.Error.ValidationError){
                const errorMessages = []
                for (let path in err.errors){
                    if(err.errors.hasOwnProperty(path)){
                        errorMessages.push(err.errors[path].message)
                    }
                }
                return res.status(400).send({
                    error : errorMessages.join(', ')
                })
            }
            if (err.keyValue?.subjectName){
                return res.status(409).send({
                    error : "Bad Credentials!",
                    message : "Subject allready exists!"
                })
            }
                return res.status(400).send({
                    error : err.message,
                    message : "Some error occured while creating the subject!"
                })
        })
    }catch(e) {
        return res.status(500).send({
            error : e.message,
            message : "Server error!"
        })

    }
}


//get All subjects
exports.findAllSubjects = (req,res) => {
    try{
        Subject.find({}).then( subjects => {
            if(subjects.length === 0){
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
exports.findSubjectByName = (req,res) => {
    try{
        const { subjectName } = req.params
        if (!subjectName) {
            return res.status(500).send({
                error : "Bad Request!"
            })
        }
        Subject.findOne({subjectName}).then( subject =>{
            if (!subject){
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

//update subject 
exports.updateSubject = async (req,res) => {
    try {
        const  subjectName  = req.params.subjectName
        if (!subjectName){
            return res.status(500).send({
                error : "Bad Request!"
            })
        }
        if (!req.body.properties){
            const subject = await Subject.findOne({subjectName : subjectName})
            req.body = {...req.body, properties : subject.properties }
        }else{
            for (let x=0 ; x < req.body.properties.length; x++){
                let currentSectionName = req.body.properties[x].sectionName
                const section = await Section.findOne({sectionName : currentSectionName})
                if (!section){
                    return res.status(400).send({
                        error : "Section "+currentSectionName+ " cannot be added or updated"
                    })
                }
            }
        }
        for (let i =0 ; i< req.body.properties.length ; i++){
            for ( let j=i+1 ; j< req.body.properties.length ; j++){
                if (req.body.properties[i].sectionName == req.body.properties[j].sectionName){
                    return res.status(400).send({
                        error : "Can not insert a duplicated section in the same subject!"
                    })
                }
            }
        }
        Subject.findOneAndUpdate({subjectName : subjectName}, req.body, {new : true, runValidators : true}).then( subject => {
            if(!subject){
                return res.status(404).send({
                    message : "Subject with name : " + subjectName + " Not found!",
                    updated : false
                })
            }
            return res.status(200).send({
                subject,
                updated : true
            })  
        }).catch(err => {
            if (err instanceof mongoose.Error.ValidationError){
                const errorMessages = []
                for (let path in err.errors){
                    if(err.errors.hasOwnProperty(path)){
                        errorMessages.push(err.errors[path].message)
                    }
                }
                return res.status(400).send({
                    error : errorMessages.join(', ') + "|| for subject name :" + subjectName
                })
            }
            if (err.kind = 'ObjectId'){
                return res.status(400).send({
                    error : "Coefficient should be a number"
                })
            }
            return res.status(400).send({
                error : err.message,
                message : "Some error occured while updating the subject with name " + subjectName
            })    
        })
    }catch(e) {
        return res.status(500).send({
            error : e.message,
            message : "Server error!"
        })
    }
}

//delete a subject
exports.deleteSubject = (req,res) => {
    try{
        const { subjectName } = req.params
        if (!subjectName){
            return res.status(400).send({
                error : "Bad Request!"
            })
        }
        Subject.findOneAndDelete({subjectName : subjectName}).then( subject => {
            if (!subject){
                return res.status(404).send({
                    message : "Subject with name " + subjectName + "Not found!",
                    deleted : false
                })
            }
            return res.status(200).send({
                message : "Subject with the name " + subjectName + " Successfully deleted",
                deleted : true
            })
        }).catch( err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound'){
                return res.status(404).send({
                    error : "Subject with the name " + subjectName + "not found!"
                })
            }
            return res.status(400).send({
                error : err.message,
                message : "Some error occured while deleting the subject with name " + subjectName
            })
        })
    }catch(e) {
        return res.status(500).send({
            error : e.message,
            message : "Server error!"
        })
    }
}

// activate or disactivate a subject from a section
exports.changeSubjectState = (req,res)  => {
    try{
        const { subjectName , sectionName , active} = req.body
        if (!subjectName || !sectionName || active === undefined){
            return res.status(400).send({
                error : "Bad Request!"
            })
        }
        Subject.findOneAndUpdate( {subjectName : subjectName, 'properties.sectionName' : sectionName}, { $set : {'properties.$.active' : active}} , {new : true , runValidators : true} ).then( subject => {
            if (!subject){
                return res.status(404).send({
                    error : "Please verify that the Subject " + subjectName + " exists or that the Section " +sectionName+ " includes into the Subject ",
                    updated : false
                })
            }
            return res.status(200).send({
                subject,
                updated : true
            })
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name ==='NotFound'){
                return res.status(404).send({
                    error : err.message,
                    message : "Subject " + subjectName + " not found! or the Section " + sectionName + " does not include the Subject"
                })
            }
            return res.status(400).send({
                error : err.message,
                message : "Some error occured while changing the subject state!!"
            })
        })
    }catch(e) {
        return res.status(500).send({
            error : e.message,
            message : "Server error!"
        })
    }
}