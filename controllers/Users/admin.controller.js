const Admin = require('../../models/Users/admin.model')
const bcrypt = require("bcryptjs")
const generateToken = require('../../functions/generateToken')



//Create a new Admin
exports.createAdmin = async (req,res) => {
    try{
        const {username , password , role} = req.body
        if(!username || !password || !role){
            return res.status(400).send({
                error : 'Bad Request!'
            })
        }
        if (req.body.password.length < 6){
            return res.status(400).send({
                error : "password Length should be >= 6"
            })
        }
        const encryptedPassword = await bcrypt.hash(req.body.password, 10)
        const admin = new Admin({
            username : username || null,
            password : password || null,
            role : role || null
        })
        admin.save().then( data => {
            console.log(data)
            return res.status(201).send({
                _id : data._id,
                username : data.username,
                role : data.role
            })
        }).catch( err => {
            if (err.keyValue?.username){
                return res.status(409).json({
                    error : "conflict Username!",
                    message : "username already exist"
                })
            }else{
                return res.status(400).send({
                    error : err.message,
                    message : "Student cannot be inserted!"
                })
            }
        })
    }catch(e) {
        res.status(500).send({
            error : e.message,
            message : "Server error!"
        })
    }
}

//Retrieve all Admins
exports.findAllAdmins = (req,res) => {
    try{    
        Admin.find({},{password : 0}).then(admins => {
            if (admins.length == 0){
                return res.status(204).send({
                    message : "There is no admins in database!",
                    found : false
                })
            }
            return res.status(200).send({admins, found: true})
            }).catch(err => {
                return res.status(400).send({
                error : err.message,
                message : "Some error occured while retrieving all admins!"
            })
        })
    }catch(e) {
        return res.status(500).send({
            error : e.message,
            message : "Server error!"
        })
    }
}


//Retrieve Admin by Id 
 exports.findOneAdmin = (req,res) => {
    try{
        if (!req.params.adminId){
            return res.status(400).send({
                error : "Admin id is required!"
            })
        }
        Admin.findById(req.params.adminId, {password : 0}).then(admin => {
            if (admin.length == 0){
                return res.status(404).send({
                    message : "Admin with the id:" + req.params.adminId + "not found!",
                    found : false
                })
            }
            return res.status(200).send({
                admin,
                found : true
            })
        }).catch(err => {
            if (err.kind === "ObjectId" ){
                return res.status(404).send({
                    error : "Admin not found with id: "+req.params.adminId
                })
            }
            return res.status(400).send({
                error : "Some Error while finding admin with id" + req.params.adminId
            })
        })
    }catch(e) {
        res.status(500).send({
            error : e.message,
            message : "Server error!"
        })
    } 
 }



 // Delete an Admin with the specified adminId

 exports.deleteAdmin = (req,res) => {
    try{
        if(!req.params.adminId){
            return res.status(400).send({
                error : "Bad Request!"
            })
        }
        const { adminId } = req.params 
        Admin.findByIdAndRemove(adminId).then( admin => {
            if (!admin){
                return res.status(404).send({
                    message : "student not found with id " + adminId,
                    deleted : false
                })
            }
            return res.status(200).send({
                message : "Student deleted Successfully!!",
                deleted : true
            })
        }).catch(err => {
            if ( err.kind === "ObjectId" || err.name === 'NotFound'){
                return res.status(404).send({
                    error: "Student not found with id" + adminId
                })
            }
            return res.status(400).send({
                error : "Some Error occured while finding student with id"+ adminId
            })
        })
    }catch(e) {
        return res.status(500).send({
            error : e.message,
            message : "Server error!"
        })
    }
 }


 //login for the Admin
 exports.login = async (req,res) => {
    try{
        const { username, password } = req.body
        if (!username || !password){    
            return res.status(400).send({
                error : "Credentials required!"
            })
        }
        Admin.findOne({username}).then( async (admin) => {
            if (admin && await (bcrypt.compare(password,admin.password))){
                const token = generateToken({
                    username : admin.username ,
                    role : admin.role
                }, '3d')
                return res.status(200).json({logged : true , token})
            }else {
                return res.status(404).json({logged : false})
            }
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name == "NotFound"){
                return res.status(404).send({
                    error : "Admin with username:" + username + " not found!"
                })
            }
            console.log(err.message)
            return res.status(400).send({
                error : "Some error occured while admin attempting to Log in!"
            })
        })
    }catch(e) {
        return res.status(500).send({
            error : e.message,
            message : "Server error!"
        })
    }
}

// update Admin by adminId
exports.updateAdmin = async (req,res) => {
    try{
        if (!req.params.adminId){
            return res.status(400).send({
                error : "Bad Request"
            })
        }
        if (req.body.password){
            if (req.body.password.length < 6){
                return res.status(400).send({
                    error : "password Length should be >= 6"
                })
            }else{
                req.body.password = await bcrypt.hash(req.body.password, 10)
            }
        }
        // assuming that the request body have the same database attributes name
        Admin.findByIdAndUpdate(req.params.adminId, req.body, {new : true, runValidators : true, fields : {password : 0}}).then( admin => {
            if (student.length == 0){
                return res.status(404).send({
                    message : "Admin with id: " +req.params.adminId + " not found",
                    found : false
                })
            }
            return res.status(200).send({
                admin,
                found : true
            })
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound'){
                return res.status(404).send({
                    error : "Admin with id: " +req.params.adminId + " not found"
                })
            }
            if (err.keyValue?.username){
                return res.status(409).send({
                    error : "Conflict username",
                    message : "Username already exist!"
                })
            }
            return res.status(400).send({
                error : "Some Error occured while updating the admin with id : "+ req.params.adminId
            })
        })
    }catch (e) {
        return res.status(500).send({
            error : e.message,
            message : "Server error!"
        })
    }
}


   

