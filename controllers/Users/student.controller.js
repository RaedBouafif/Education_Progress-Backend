const Student = require('../../models/Users.model/student.model')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const generateToken = require('../../functions/generateToken')


//Create a new student
exports.create = async (req,res) => {
    try{
        if(!req.body){
            return res.status(400).send({
                message : 'Eleve can not be empty'
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
exports.findAll = (req,res) => {
    try{    
        Student.findAll().then(students => {
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
 exports.findOne = (req,res) => {
    try{
        Student.findById(req.params.studentId).then(student => {
            if (!student){
                return res.status(404).send({
                    message : "Student with the id:" + req.params.studentId + "not found!"
                })
            }
            res.status(200).send(student)
        }).catch(err => {
            if (err.kind === "ObjectId" ){
                return res.status(404).send({
                    message : "Student not found with id: "+req.params.studentId
                })
            }
            return res.status(400).send({
                message : "Error while finding student with id" + req.params.studentId
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

 exports.delete = (req,res) => {
    try{
        const { studentId } = req.params 
        Student.findByIdAndRemove(studentId).then( student => {
            if (!student){
                return res.status(404).send({
                    message : "student not found with id " + studentId
                })
            }
            res.status(200).send({
                message : "Student deleted Successfully!!"
            })
        }).catcht(err => {
            if ( err.kind === "ObjectId" || err.name === 'NotFound'){
                return res.status(404).send({
                    message: "Student not found with id" + studentId
                })
            }
            return res.status(400).send({
                message : "Error occured while finding student with id"+ studentId
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
                message : "Credentialss required!"
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
            return res.status(400).send({
                message : "Student with username:" + username + " not found!"
            })
        })
    }catch(e) {
        res.status(500).send({
            error : e.message,
            message : "Server error!"
        })
    }
}
   

