const TeacherModel = require("../../models/Users/teacher.model")
const SubjectModel = require("../../models/subject.model");
const { Types } = require("mongoose");
const bcrypt = require("bcryptjs")
const generateToken = require("../../functions/generateToken")


exports.create = async (req, res) => {
    try {
        const { firstName, lastName, email, tel, password, salary } = req.body
        if (!firstName || !lastName || !email || !tel || !password || !salary)
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
            salary
        });
        await teacher.save();
        return res.status(201).json({
            _id: teacher._id,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            email: teacher.email,
            tel: teacher.tel,
            salary: teacher.salary,
        });
    } catch (e) {
        console.log(e);
        if (e.keyValue?.email)
            res.status(409).json({
                error: "conflictEmail",
                message: "Email already used",
            });
        else if (e.keyValue?.tel)
            res.status(409).json({
                error: "conflictTel",
                message: "Tel already used",
            });
        else {
            console.log(e);
            return res.status(500).json({
                error: "serverSideError",
            });
        }
    }
}



exports.getTeacherById = async (req, res) => { //WithSubjects
    try {
        if (!req.params.teacherId)
            return res.status(400).json({ error: "teacherIdRequired" });
        const teacher = await TeacherModel.findById(
            req.params.teacherId,
            "firstName lastName email tel salary"
        ).populate("subjects")
        if (teacher) return res.status(200).json({ found: true, teacher });
        else return res.status(404).json({ found: false })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ error: "serverSideError" });
    }
}


exports.getAllTeachers = async (req, res) => {
    try {
        const teachers = await TeacherModel.find({}, { password: 0 }).populate("subjects")
        return teachers.length ? res.status(200).json({ teachers, found: true }) :
            res.status(204).json({ found: false, message: "noTeachers" })
    } catch {
        return res.status(500).json({ error: "serverSideError" });
    }
}


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({
                error: "credentialsRequired",
            });
        const teacher = await TeacherModel.findOne({ email: email.trim() });
        if (teacher && (await bcrypt.compare(password, teacher.password))) {
            const token = generateToken(
                {
                    email: teacher.email,
                    firstName: teacher.firstName,
                    lastName: teacher.lastName,
                    tel: teacher.tel,
                    salary: teacher.salary
                },
                "3d"
            );
            return res.status(200).json({ logged: true, token });
        } else {
            return res.status(404).json({ logged: false });
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({ error: "serverSideError" });
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
            req.body.password = await bcrypt.hash(req.body.password, 10)
        const newTeacher = await TeacherModel.findByIdAndUpdate(req.params.teacherId, req.body, {
            new: true,
            runValidators: true,
            fields: { password: 0 }
        });
        if (newTeacher)
            return res.status(200).json({
                newTeacher,
                found: true,
            });
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
        else {
            console.log(e);
            return res.status(500).json({
                error: "serverSideError",
            });
        }
    }
};

exports.addSubject = async (req, res) => {//need test
    try {
        const subjectId = req.params.subjectId
        const idTeacher = req.params.idTeacher
        if (!subjectId || !idTeacher)
            return res.status(400).json({
                error: "badRequest",
            });
        const teacher = await TeacherModel.findById(idTeacher, { password: 0 })
        if (!teacher)
            return res.status(404).json({ teacher: { found: false } })
        console.log(teacher.subjects)
        teacher.subjects.push(new Types.ObjectId(subjectId))
        await teacher.save()
        return res.status(200).json({ teacher: { found: true } })
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            error: "serverSideError",
        });
    }
}