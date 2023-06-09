const Admin = require('../../models/Users/admin.model')
const bcrypt = require("bcryptjs")
const generateToken = require('../../functions/generateToken')
const sharp = require('sharp');
const { logData } = require("../../functions/logging")
const jwt = require("jsonwebtoken")






//Create a new Admin
exports.createAdmin = async (req, res) => {
    try {
        const { username, password, role, firstName, lastName, tel, email, gender, adresse, birth, file, note } = req.body
        if (!username || !password || !role || !firstName || !lastName || !tel || !email || !birth) {
            return res.status(400).send({
                error: 'Bad Request!'
            })
        }
        if (req.body.password.length < 6) {
            return res.status(400).send({
                error: "password Length should be >= 6"
            })
        }
        const encryptedPassword = await bcrypt.hash(password, 10)
        const admin = new Admin({
            username: username,
            password: encryptedPassword,
            role: role,
            firstName: firstName,
            lastName: lastName,
            tel: tel,
            email: email,
            birth: birth,
            gender: gender || null,
            adresse: adresse || null,
            image: file || null,
            note: note || null
        })
        admin.save().then(data => {
            if (data) {
                try{
                    logData({ modelId: admin._id, modelPath: "Admin", action: "Created new admin: " +admin._id.toString()})
                }catch(e){
                    console.log(e.message)
                }
                console.log(data)
                return res.status(201).send({
                    created: true,
                    admin
                })
            }
        }).catch(err => {
            console.log(err.message)
            if (err.code === 11000) {
                return res.status(409).send({
                    error: "BadRequest"
                })
            }
            if (err.keyValue?.username) {
                return res.status(409).json({
                    error: "conflictUsername",
                    message: "username already exist"
                })
            } else if (err.keyValue?.tel) {
                return res.status(409).json({
                    error: "conflictTel",
                    message: "Phone number already exist"
                })
            } else if (err.keyValue?.email) {
                return res.status(409).send({
                    error: "conflictEmail",
                    message: "Email already exist"
                })
            } else if (err.error?.email) {
                return res.status(400).send({
                    error: "InvalidEmail"
                })
            }
            else {
                return res.status(400).send({
                    error: err.message,
                    message: "Admin cannot be inserted!"
                })
            }
        })
    } catch (e) {
        return res.status(500).send({
            error: e.message,
            message: "Server error!"
        })
    }
}
exports.findAdminByName = async (req, res) => {
    try {
        const { word } = req.params
        const regex = new RegExp(word, "i");
        const admins = await Admin.find({
            $expr: {
                $regexMatch: {
                    input: { $concat: ["$firstName", " ", "$lastName"] },
                    regex: regex,
                },
            }
        }, { password: 0 }).sort({ createdAt: -1 })
        if (admins.length) {
            return res.status(200).json(admins)
        }
        else {
            return res.status(204).json([])
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: "serverSideError" });
    }
}

//Retrieve all Admins
exports.findAllAdmins = (req, res) => {
    try {
        Admin.find({}, { password: 0 }).then(admins => {
            if (admins.length == 0) {
                return res.status(204).send({
                    message: "There is no admins in database!",
                    found: false
                })
            }
            return res.status(200).send({ admins, found: true })
        }).catch(err => {
            return res.status(400).send({
                error: err.message,
                message: "Some error occured while retrieving all admins!"
            })
        })
    } catch (e) {
        return res.status(500).send({
            error: e.message,
            message: "Server error!"
        })
    }
}


//Retrieve Admin by Id 
exports.findOneAdmin = (req, res) => {
    try {
        if (!req.params.adminId) {
            return res.status(400).send({
                error: "Admin id is required!"
            })
        }
        Admin.findById(req.params.adminId, { password: 0 }).then(admin => {
            if (admin.length == 0) {
                return res.status(404).send({
                    message: "Admin with the id:" + req.params.adminId + "not found!",
                    found: false
                })
            }
            return res.status(200).send({
                admin,
                found: true
            })
        }).catch(err => {
            if (err.kind === "ObjectId") {
                return res.status(404).send({
                    error: "Admin not found with id: " + req.params.adminId
                })
            }
            return res.status(400).send({
                error: "Some Error while finding admin with id" + req.params.adminId
            })
        })
    } catch (e) {
        res.status(500).send({
            error: e.message,
            message: "Server error!"
        })
    }
}



// Delete an Admin with the specified adminId

exports.deleteAdmin = (req, res) => {
    try {
        if (!req.params.adminId) {
            return res.status(400).send({
                error: "Bad Request!"
            })
        }
        const { adminId } = req.params
        Admin.findByIdAndRemove(adminId).then(admin => {
            if (!admin) {
                return res.status(404).send({
                    message: "student not found with id " + adminId,
                    deleted: false
                })
            }
            try{
                logData({ modelId: admin._id, modelPath: "Admin", action: "Deleted admin: " +admin._id.toString() })
            }catch(e){
                console.log(e.message)
            }
            return res.status(200).send({
                message: "Student deleted Successfully!!",
                deleted: true
            })
        }).catch(err => {
            if (err.kind === "ObjectId" || err.name === 'NotFound') {
                return res.status(404).send({
                    error: "Student not found with id" + adminId
                })
            }
            return res.status(400).send({
                error: "Some Error occured while finding student with id" + adminId
            })
        })
    } catch (e) {
        return res.status(500).send({
            error: e.message,
            message: "Server error!"
        })
    }
}


//login for the Admin
exports.login = async (req, res) => {
    try {
        console.log(req.body)
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).send({
                error: "Credentials required!"
            })
        }
        Admin.findOne({ username }).then(async (admin) => {
            const encryptedPassword = await (bcrypt.compare(password, admin.password))
            console.log(encryptedPassword)
            if (admin && encryptedPassword) {
                var img = null
                if (admin.image) {
                    const imageBuffer = Buffer.from(admin.image, 'base64')
                    img = await sharp(imageBuffer)
                        .resize({ width: 60, height: 60 })
                        .toBuffer()
                }
                const token = generateToken({
                    username: admin.username,
                    role: admin.role,
                    _id: admin._id,
                    image: img?.toString('base64'),
                    firstName: admin.firstName,
                    lastName: admin.lastName
                }, '3d')
                res.cookie("tck", token, {
                    httpOnly: true,
                    sameSite: "None",
                    secure: true,
                    maxAge: 365 * 24 * 60 * 15 * 1000
                })
                return res.status(200).json({ logged: true })
            } else {
                return res.status(404).json({ logged: false })
            }
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name == "NotFound") {
                return res.status(404).send({
                    error: "Admin with username:" + username + " not found!"
                })
            }
            console.log(err.message)
            return res.status(404).send({
                error: "NotFound"
            })
        })
    } catch (e) {
        return res.status(500).send({
            error: e.message,
            message: "Server error!"
        })
    }
}

// update Admin by adminId
exports.updateAdmin = async (req, res) => {
    try {
        if (!req.params.adminId) {
            return res.status(400).send({
                error: "Bad Request"
            })
        }
        if (req.body.password) {
            if (req.body.password.length < 6) {
                return res.status(400).send({
                    error: "password Length should be >= 6"
                })
            } else {
                req.body.password = await bcrypt.hash(req.body.password, 10)
            }
        }
        // assuming that the request body have the same database attributes name
        Admin.findByIdAndUpdate(req.params.adminId, req.body, { new: true, runValidators: true, fields: { password: 0 } }).then(admin => {
            if (admin.length == 0) {
                return res.status(404).send({
                    message: "Admin with id: " + req.params.adminId + "not found",
                    updated: false
                })
            }
            try{
                logData({ modelId: admin._id, modelPath: "Admin", action: "Updated admin " +admin._id.toString()})
            }catch(e){
                console.log(e.message)
            }
            return res.status(200).send({
                updated: true,
                admin
            })
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    error: "Admin with id: " + req.params.adminId + " not found"
                })
            }
            if (err.keyValue?.username) {
                return res.status(409).send({
                    error: "conflictUsername",
                    message: "Username already exist!"
                })
            }
            if (err.keyValue?.email) {
                return res.status(409).send({
                    error: "conflictEmail",
                    message: "Username already exist!"
                })
            }
            if (err.keyValue?.tel) {
                return res.status(409).send({
                    error: "conflictTel",
                    message: "Username already exist!"
                })
            }
            if (err.name === 'ValidationError') {
                return res.status(409).send({
                    error: "Conflict role",
                    message: "The role given cannot be inserted!"
                })
            }
            console.log(err.name)
            return res.status(400).send({
                error: "Some Error occured while updating the admin with id : " + req.params.adminId
            })
        })
    } catch (e) {
        return res.status(500).send({
            error: e.message,
            message: "Server error!"
        })
    }
}



exports.welcome = async (req, res) => {
    try {
        return res.status(200).json({
            data: req.body.decodedToken
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            error: "serverSideError"
        })
    }
}


exports.logout = async (req, res) => {
    try {
        res.clearCookie('tck')
        return res.status(200).json({ success: true })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            error: "serverSideError"
        })
    }
}

exports.countDocsss = async (req, res) => {
    try {
        const decoded = await jwt.verify(req.cookies.tck, process.env.TOKEN_KEY)
        console.log(decoded)
        const countAdmin = await Admin.countDocuments()
        return res.status(200).send({ number: countAdmin || 0 })
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error!"
        })
    }
}



