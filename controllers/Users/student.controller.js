const Student = require('../../models/Users.model/student.model')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const generateToken = require('../../functions/generateToken')


//Create a new student
exports.createStudent = async (req,res) => {
    try{
        if(!req.body){
            return res.status(400).send({
                error : 'Bad Request'
            })
        }
        const encryptedPassword = await bcrypt.hash(req.body.password.trim(), 10)
        const student = new Student({
            firstName : req.body.firstName || null,
            lastName : req.body.lastName || null,
            username : req.body.username || null,
            password : encryptedPassword || null,
            birth : req.body.birth || null,
        })
        Student.save().then( data => {
            res.status(201).send(data)
        }).catch( err => {
            if (err.keyValue?.username){
                res.status(409).json({
                    error : "conflict Username!",
                    message : "username already exist"
                })
            }else{
                res.status(400).send({
                    error : err.message,
                    message : "Student cannot be inserted!"
                })
            }
        })
    }catch(e) {
        res.status(500).send({
            error : err.message,
            message : "Server error!"
        })
    }
}

//Retrieve all students
exports.findAllStudents = (req,res) => {
    try{    
        Student.findAll().then(students => {
            if (!students){
                res.status(404).send({
                    error : "There is no students in the database!"
                })
            }
            res.status(200).send(students)
            }).catch(err => {
                res.status(400).send({
                error : err.message,
                message : "Some error occured while retrieving all students!"
            })
        })
    }catch(e) {
        res.status(500).send({
            error : e.message,
            message : "Server error!"
        })
    }
}


//Reetrieve Student by Id 
 exports.findOneStudent = (req,res) => {
    try{
        if (!req.params.studentId){
            return res.status(400).send({
                error : "Student id is required!"
            })
        }
        Student.findById(req.params.studentId).then(student => {
            if (!student){
                return res.status(404).send({
                    error : "Student with the id:" + req.params.studentId + "not found!",
                    found : false
                })
            }
            res.status(200).send({
                student,
                found : true
            })
        }).catch(err => {
            if (err.kind === "ObjectId" ){
                return res.status(404).send({
                    error : "Student not found with id: "+req.params.studentId
                })
            }
            return res.status(400).send({
                error : "Some Error while finding student with id" + req.params.studentId
            })
        })
    }catch(e) {
        res.status(500).send({
            error : e.message,
            message : "Server error!"
        })
    } 
 }



 // Delete a Student with the specified studentId

 exports.deleteStudent = (req,res) => {
    try{
        if(!req.body){
            return res.status(400).send({
                error : "Bad Request!"
            })
        }
        const { studentId } = req.params 
        Student.findByIdAndRemove(studentId).then( student => {
            if (!student){
                return res.status(404).send({
                    message : "student not found with id " + studentId,
                    deleted : false
                })
            }
            res.status(200).send({
                message : "Student deleted Successfully!!",
                deleted : true
            })
        }).catcht(err => {
            if ( err.kind === "ObjectId" || err.name === 'NotFound'){
                return res.status(404).send({
                    error: "Student not found with id" + studentId
                })
            }
            return res.status(400).send({
                error : "Some Error occured while finding student with id"+ studentId
            })
        })
    }catch(e) {
        res.status(500).send({
            error : e.message,
            message : "Server error!"
        })
    }
 }


 //login for the Student
 exports.login() = async (req,res) => {
    try{
        const { username, password } = req.body
        if (!username || !password){
            return res.status(400).send({
                error : "Credentialss required!"
            })
        }
        Student.findOne({username : username}).then( student => {
            if (student && await (bcrypt.compare(password.trim(),student.password))){
                const token = generateToken({
                    firstName : req.body.firstName,
                    lastName : req.body.lastName ,
                    username : req.body.username ,
                    password : encryptedPassword ,
                    birth : req.body.birth 
                })
                return res.status(200).json({logged : true , token})
            }else {
                return res.status(404).json({logged : false})
            }
        }).catch(err => {
            if (err.kind === 'ObjectId'){
                return res.status(404).send({
                    error : "Student with username:" + username + " not found!"
                })
            }
            return res.status(400).send({
                error : "Some error occured while user attempting to Log in!"
            })
        })
    }catch(e) {
        res.status(500).send({
            error : e.message,
            message : "Server error!"
        })
    }
}

// update student by id
exports.updateStudent() = (req,res) => {
    try{
        if (!req.body){
            return res.status(400).send({
                error : "Bad Request"
            })
        }
        // assuming that the request body have the same database attributes name
        Student.findByIdAndUpdate(req.body.studentId, req.body, {new : true}).then( student => {
            if (!student){
                return res.status(400).send({
                    message : "Student with id: " +req.body.studentId + " not found",
                    found : false
                })
            }
            return res.statues(200).send({
                student,
                found : true
            })
        }).catch(err => {
            if (err.kind === 'ObjectId'){
                return res.status(404).send({
                    error : "Student with id: " +req.body.studentId + " not found"
                })
            }
            if (err.keyValue?.username){
                return res.status(409).send({
                    error : "Conflict email",
                    message : "Username already exist!"
                })
            }
            return res.status(400).send({
                error : "Some Error occured while updating the student with id : "+ req.body.studentId
            })
        })
    }catch (e) {
        res.status(500).send({
            error : e.message,
            message : "Server error!"
        })
    }

}


   

