const TeacherModel = require("../../models/Users/teacher.model");
const { Subject } = require("../../models/subject.model");
const ReportModel = require("../../models/reports.model")
const TeacherAbsence = require("../../models/teacherAbsence.model")
const CollegeYear = require("../../models/collegeYear.model")
const bcrypt = require("bcryptjs");
const generateToken = require("../../functions/generateToken");
const { Schema, Types } = require("mongoose");
const sharp = require('sharp');
const SessionModel = require("../../models/session.model")
const { logData } = require("../../functions/logging")

exports.create = async (req, res) => {
    try {
        const { firstName, lastName, email, tel, password, gender, maritalStatus, note, image, adresse, subjects, birth } = req.body;
        if (!firstName || !lastName || !email || !tel || !password || !gender || !maritalStatus || !birth)
            return res.status(400).json({
                error: "badRequest",
            });
        if (password.length < 6)
            return res.status(400).json({
                error: "passwordMinLength",
            });
        const encryptedPassword = await bcrypt.hash(password, 10);
        const teacher = await TeacherModel.create({
            firstName,
            lastName,
            email,
            tel,
            password: encryptedPassword,
            gender,
            maritalStatus,
            note: note || null,
            image: image || null,
            adresse: adresse || null,
            subjects: subjects?.split(",") || null,
            birth
        });
        await teacher.save();
        if (subjects) {
            for (var id_subject of subjects?.split(",")) {
                var sbj = await Subject.findById(id_subject)
                sbj.teachers.push(teacher._id)
                await sbj.save()
            }
        }
        try{
            logData({ modelId: teacher._id, modelPath: "Teacher", action: "Created a new Teacher: " +teacher._id.toString() })
        }catch(e){
            console.log(e.message)
        }
        return res.status(201).json({
            _id: teacher._id,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            email: teacher.email,
            tel: teacher.tel,
            gender: teacher.gender,
            maritalStatus: teacher.maritalStatus,
            note: teacher.note,
            adresse: teacher.adresse,
            subjects: teacher.subjects,
            birth: teacher.birth
        });
    } catch (e) {
        console.log(e);
        if (e.keyValue?.email)
            return res.status(409).json({
                error: "conflictEmail",
                message: "Email already used",
            });
        else if (e.keyValue?.tel)
            return res.status(409).json({
                error: "conflictTel",
                message: "Tel already used",
            });
        else if (e.errors?.gender?.properties)
            return res.status(400).json({
                error: e.errors?.gender?.properties?.message
            })
        else if (e.errors?.maritalStatus?.properties)
            return res.status(400).json({
                error: e.errors?.maritalStatus?.properties?.message
            })
        else if (e.errors?.gender || e.errors?.maritalStatus || e.errors?.password || e.errors?.tel
            || e.errors?.email || e.errors?.lastName || e.errors?.firstName)
            return res.status(400).json({
                error: "badRequest"
            })
        else {
            return res.status(500).json({
                error: "serverSideError",
            });
        }
    }
};
exports.findTeacherByName = async (req, res) => {
    try {
        const { word } = req.params
        const regex = new RegExp(word, "i");
        const teachers = await TeacherModel.find({
            $expr: {
                $regexMatch: {
                    input: { $concat: ["$firstName", " ", "$lastName"] },
                    regex: regex,
                },
            }
        }, { password: 0 }).sort({ createdAt: -1 })
        if (teachers.length) {
            return res.status(200).json(teachers)
        }
        else {
            return res.status(204).json([])
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: "serverSideError" });
    }
}
exports.getTeacherById = async (req, res) => {
    //WithSubjects
    try {
        if (!req.params.teacherId)
            return res.status(400).json({ error: "teacherIdRequired" });
        const teacher = await TeacherModel.findById(
            req.params.teacherId
        ).populate("subjects");
        if (teacher) return res.status(200).json({ found: true, teacher });
        else return res.status(404).json({ found: false });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: "serverSideError" });
    }
};
const PAGE_LIMIT = 12
exports.getAllTeachers = async (req, res) => {
    try {
        var { offset, firstName, lastName, subject, absence } = req.query
        var filter = {}
        if (firstName) filter["firstName"] = { $regex: firstName, $options: 'i' }
        if (lastName) filter["lastName"] = { $regex: lastName, $options: 'i' }
        var teachers = await TeacherModel.find(filter, { password: 0 }).sort({ createdAt: -1 })
            .populate("subjects")
            .populate("responsibleSubject")
        if (subject) teachers = teachers.filter((element) => element.subjects?.find((sbj) => sbj._id == subject))
        var totalPages = Math.ceil(teachers.length / PAGE_LIMIT);
        teachers = teachers.slice(offset * PAGE_LIMIT, (offset * PAGE_LIMIT) + PAGE_LIMIT)
        return teachers?.length
            ? res.status(200).json({ teachers, found: true, totalPages })
            : res.status(204).json({ found: false });
    } catch (e) {
        console.log(e)
        return res.status(500).json({ error: "serverSideError" });
    }
};

//get list of all teachers
exports.getListOfTeachers = async (req, res) => {
    try {
        var teachers = await TeacherModel.find({}, { password: 0 }).sort({ createdAt: -1 }).populate(
            "subjects"
        )
        return teachers?.length
            ? res.status(200).json({ teachers, found: true, })
            : res.status(204).json({ found: false });
    } catch (e) {
        console.log(e)
        return res.status(500).json({ error: "serverSideError" });
    }
};


exports.deleteTeacher = async (req, res) => {
    try {
        if (!req.params.teacherId) {
            return res.status(400).send({
                error: "Bad Request!",
            });
        }
        const { teacherId } = req.params;
        TeacherModel.findByIdAndRemove(teacherId)
            .then(async (teacher) => {
                if (!teacher) {
                    return res.status(404).send({
                        message: "teacher not found with id " + teacherId,
                        deleted: false,
                    });
                }
                await SessionModel.deleteMany({ teacher: teacher._id })
                try{
                    logData({ modelId: teacher._id, modelPath: "Teacher", action: "Deleted teacher: " +teacher._id.toString() })
                }catch(e){
                    console.log(e.message)
                }
                return res.status(200).send({
                    message: "teacher deleted Successfully!!",
                    deleted: true,
                });
            })
            .catch((err) => {
                if (err.kind === "ObjectId" || err.name === "NotFound") {
                    return res.status(404).send({
                        error: "teacher not found with id" + teacherId,
                    });
                }
                return res.status(400).send({
                    error: "Some Error occured while finding teacher with id" + teacherId,
                });
            });
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            message: "serverSideError",
        });
    }
}

exports.updateTeacher = async (req, res) => {
    //request with same name of parent attributs
    try {
        if (!req.params.teacherId)
            return res.status(400).json({
                error: "badRequest",
            });
        if (req.body.password?.length < 6)
            return res.status(400).json({
                error: "passwordMinLength",
            });
        if (req.body.password)
            req.body.password = await bcrypt.hash(req.body.password, 10);
        if (req.body.email)
            req.body.email = req.body.email.toLowerCase()
        if (req.body.subjects)
            req.body.subjects = req.body.subjects?.split(",")
        else
            req.body.subjects = null
        const oldTeacher = await TeacherModel.findByIdAndUpdate(
            req.params.teacherId,
            req.body,
            {
                new: false,
                runValidators: true,
                fields: { password: 0 },
            }
        );
        if (oldTeacher) {
            const firstTable = oldTeacher.subjects ? req.body.subjects?.filter((element) => oldTeacher.subjects?.indexOf(element) === -1) : req.body.subjects
            const secondTable = req.body.subjects ? oldTeacher.subjects?.filter((element) => req.body.subjects?.indexOf(element.toString()) === -1) : oldTeacher.subjects
            console.log(firstTable)
            console.log(secondTable)
            if (firstTable) {
                for (var element of firstTable) {
                    var sbj = await Subject.findById(element)
                    sbj.teachers.push(oldTeacher._id.toString())
                    await sbj.save()
                }
            }
            if (secondTable) {
                for (var element of secondTable) {
                    var sbj2 = await Subject.findById(element)
                    console.log(sbj2)
                    sbj2.teachers = sbj2.teachers.filter((tch) => tch != oldTeacher._id.toString())
                    await sbj2.save()
                }
            }
            try{
                logData({ modelId: oldTeacher._id, modelPath: "Teacher", action: "Updated teacher: "+ oldTeacher._id.toString() })
            }catch(e){
                console.log(e.message)
            }
            return res.status(200).json({
                found: true,
            });
        }

        else
            return res.status(404).json({
                found: false,
            });
    } catch (e) {
        console.log(e);
        if (e.keyValue?.email)
            return res.status(409).json({
                error: "conflictEmail",
                message: "Email already used",
            });
        else if (e.keyValue?.tel)
            return res.status(409).json({
                error: "conflictTel",
                message: "Tel already used",
            });
        else if (e.errors?.gender?.properties)
            return res.status(400).json({
                error: e.errors?.gender?.properties?.message
            })
        else if (e.errors?.maritalStatus?.properties)
            return res.status(400).json({
                error: e.errors?.maritalStatus?.properties?.message
            })
        else if (e.errors?.gender || e.errors?.maritalStatus || e.errors?.password || e.errors?.tel
            || e.errors?.email || e.errors?.lastName || e.errors?.firstName)
            return res.status(400).json({
                error: "badRequest"
            })
        else {
            return res.status(500).json({
                error: "serverSideError",
            });
        }
    }
};

exports.addSubject = async (req, res) => {
    //need test
    try {
        const subjectId = req.params.subjectId;
        const teacherId = req.params.teacherId;
        if (!subjectId || !teacherId)
            return res.status(400).json({
                error: "badRequest",
            });
        const teacher = await TeacherModel.findById(teacherId);
        if (!teacher) return res.status(404).json({ teacherFound: false });
        const subject = await Subject.findById(subjectId);
        if (subject) {
            if (!teacher.subjects.find((element) => {
                return element.toString() === subjectId
            })) {
                //teacher already have this subject
                teacher.subjects.push(subjectId);
                await teacher.save();
                try{
                    logData({ modelId: teacher._id, modelPath: "Teacher", action: "Added subject: " +subjectId+ "to teacher: " +teacher._id.toString() })
                }catch(e){
                    console.log(e.message)
                }
                return res
                    .status(200)
                    .json({ teacherFound: true, subjectFound: true, subjectExist: false });
                //subject exist mean that teacher already have this subject
            } else {
                //teacher don't have the subject
                try{
                    logData({modelId: teacher._id, modelPath: "Teacher", action: "Affected subject: " +subjectId+ " to teacher: " +teacher._id.toString()})
                }catch(e){
                    console.log(e.message)
                }
                return res
                    .status(200)
                    .json({
                        teacherFound: true,
                        subjectFound: true,
                        subjectExist: true,
                    });
            }
        } else
            return res.status(404).json({ teacherFound: true, subjectFound: false });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            error: "serverSideError",
        });
    }
};

exports.removeSubject = async (req, res) => {
    try {
        const subjectId = req.params.subjectId;
        const teacherId = req.params.teacherId;
        if (!subjectId || !teacherId)
            return res.status(400).json({
                error: "badRequest",
            });
        const teacher = await TeacherModel.findById(teacherId);
        if (!teacher) return res.status(404).json({ teacherFound: false });
        console.log(teacher.subjects)
        if (!teacher.subjects.find(element => element.toString() === subjectId)) {
            return res.status(404).json({ teacherFound: true, subjectFound: false })
        } else {
            teacher.subjects = teacher.subjects.filter(element => element.toString() !== subjectId)
            await teacher.save()
            try{
                logData({modelId: teacher._id, modelPath: "Teacher", secondModelId: Types.ObjectId(subjectId), secondModelPath: "Subject", action: "Disaffected subject: " +subjectId+ " from teacher: " +teacher._id.toString() })
            }catch(e){
                console.log(e.message)
            }
            return res.status(200).json({ teacherFound: true, subjectFound: true })
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            error: "serverSideError",
        });
    }
}


exports.getTeacherProfile = async (req, res) => {
    try {
        const teacherId = req.params.teacherId
        var prof = await TeacherModel.findById(teacherId, { password: 0 })
            .populate({ path: "subjects" })
        //find the nbr of absence require here 
        const reports = await ReportModel.find({
            teachers: {
                $in: [teacherId]
            }
        }).sort({ createdAt: -1 })        
        const nbrAbsence = await TeacherAbsence.countDocuments({teacher: new Types.ObjectId(teacherId)})
        if (prof) return res.status(200).json({ prof, reports, nbrAbsence: nbrAbsence })
        return res.status(404).json({})
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            error: "serverSideError"
        })
    }
}




exports.countDocsss = async (req, res) => {
    try {
        const countTeachers = await TeacherModel.countDocuments()
        return res.status(200).send({ number: countTeachers || 0 })
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "Server Error!"
        })
    }
}

//login teacher
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        const teacher = await TeacherModel.findOne({ email: email })
        if (!teacher) {
            return res.status(404).send({
                error: "Teacher Not Found"
            })
        } else {
            const encryptedPassword = await (bcrypt.compare(password, teacher.password))
            if (encryptedPassword) {
                var img = null
                if (teacher.image) {
                    const imageBuffer = Buffer.from(teacher.image, 'base64')
                    img = await sharp(imageBuffer)
                        .resize({ width: 60, height: 60 })
                        .toBuffer()
                }
                const token = generateToken({
                    _id: teacher._id,
                    email: teacher.email,
                    firstName: teacher.firstName,
                    lastName: teacher.lastName,
                    tel: teacher.tel,
                    image: img?.toString('base64'),
                    role: "teacher"
                }, "3d")
                res.cookie("tck", token, {
                    httpOnly: true,
                    sameSite: "Strict",
                    secure: true,
                    maxAge: 365 * 24 * 60 * 60 * 1000
                })
                console.log(img?.toString('base64'))

                return res.status(200).json({ logged: true })
            } else {
                return res.status(404).json({ logged: false })
            }
        }
    } catch (e) {
        console.log(e)
        if (e.kind === 'ObjectId' || e.name == "NotFound") {
            return res.status(404).send({
                error: "Teacher with username:" + email + " not found!"
            })
        }
        return res.status(500).send({
            error: e.message,
            message: "Server error!"
        })
    }
}


// //welcome
// exports.welcome = async (req, res) => {
//     try {
//         console.log(req.body)
//         return res.status(200).json({
//             data: req.body.decodedToken
//         })
//     } catch (e) {
//         console.log(e)
//         return res.status(500).json({
//             error: "serverSideError"
//         })
//     }
// }

//logout
// exports.logout = async (req, res) => {
//     try {
//         console.log("hello logut")
//         res.clearCookie('tck')
//         return res.status(200).json({ success: true })
//     } catch (e) {
//         console.log(e)
//         return res.status(500).json({
//             error: "serverSideError"
//         })
//     }
// }
