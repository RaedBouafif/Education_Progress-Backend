const TeacherModel = require("../../models/Users/teacher.model");
const { Subject } = require("../../models/subject.model");
const bcrypt = require("bcryptjs");
const generateToken = require("../../functions/generateToken");
const { Schema } = require("mongoose");

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
                await Subject.findByIdAndUpdate(id_subject, { $push: { teachers: teacher._id } }, { runValidators: true, new: true })
            }
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

exports.getTeacherById = async (req, res) => {
    //WithSubjects
    try {
        if (!req.params.teacherId)
            return res.status(400).json({ error: "teacherIdRequired" });
        const teacher = await TeacherModel.findById(
            req.params.teacherId,
            "firstName lastName email tel gender maritalStatus"
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
        console.log(filter)
        var teachers = await TeacherModel.find(filter, { password: 0 }).sort({ createdAt: -1 }).populate(
            "subjects"
        )
        console.log(teachers.length)
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

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({
                error: "credentialsRequired",
            });
        const teacher = await TeacherModel.findOne({ email: email.toLowerCase().trim() });
        if (teacher && (await bcrypt.compare(password, teacher.password))) {
            const token = generateToken(
                {
                    email: teacher.email.toLowerCase().trim(),
                    firstName: teacher.firstName,
                    lastName: teacher.lastName,
                    tel: teacher.tel,
                    gender: teacher.gender,
                    maritalStatus: teacher.maritalStatus
                },
                "3d"
            );
            return res.status(200).json({ logged: true, token });
        } else {
            return res.status(404).json({ logged: false });
        }
    } catch (e) {
        console.log(e);
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
            .then((teacher) => {
                if (!teacher) {
                    return res.status(404).send({
                        message: "teacher not found with id " + teacherId,
                        deleted: false,
                    });
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
        console.log(oldTeacher.subjects)
        if (oldTeacher) {
            if (req.body.subjects) {
                const firstTable = req.body.subjects.filter((element) => oldTeacher.subjects?.indexOf(element) === -1)
                const secondTable = oldTeacher.subjects.filter((element) => req.body.subjects?.indexOf(element) === -1)
                for (var element of firstTable) {
                    await Subject.findByIdAndUpdate(element, { $push: { teachers: oldTeacher._id } }, { runValidators: true, new: true })
                }
                for (var element of secondTable) {
                    await Subject.findByIdAndUpdate(element, { $pull: { teachers: oldTeacher._id } }, { runValidators: true, new: true })
                }
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
                return res
                    .status(200)
                    .json({ teacherFound: true, subjectFound: true, subjectExist: false });
                //subject exist mean that teacher already have this subject
            } else {
                //teacher don't have the subject
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
            return res.status(200).json({ teacherFound: true, subjectFound: true })
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            error: "serverSideError",
        });
    }
}


exports.countDocsss = async (req, res) => {
    try{
        const countTeachers = await TeacherModel.countDocuments()
        return res.status(200).send({number : countTeachers || 0})
    }catch(e) {
        console.log(e)
        return res.status(500).send({
            error : "Server Error!"
        })
    }
}