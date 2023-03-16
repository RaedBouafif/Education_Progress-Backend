const Student = require("../../models/Users/student.model");
const bcrypt = require("bcryptjs");
const generateToken = require("../../functions/generateToken");
const Parent = require("../../models/Users/parent.model");
const Group = require("../../models/group.model")
const { Types } = require("mongoose");
require("dotenv").config();


//Create a new student
exports.createStudent = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).send({
                error: "Bad Request",
            });
        }
        if (req.body.password.length < 6) {
            return res.status(400).send({
                error: "password Length should be >= 6",
            });
        }
        const encryptedPassword = await bcrypt.hash(req.body.password, 10);
        const student = new Student({
            firstName: req.body.firstName || null,
            lastName: req.body.lastName || null,
            username: req.body.username || null,
            password: encryptedPassword || null,
            birth: req.body.birth || null,
            gender: req.body.gender || null,
            parent: new Types.ObjectId(req.body.idParent || null),
            // group: new Types.ObjectId(req.body.groupId || null),
            image: req.body.file || null,
            adresse: req.body.adresse || null,
            tel: req.body.tel || null,
            note: req.body.note || null
        });
        student
            .save()
            .then(async (data) => {
                // updating groupe
                // const group = await Group.findOneAndUpdate( //findByIdAndUpdate
                //     req.body.groupId,
                //     { $push: { students: new Types.ObjectId(data._id) } },
                //     { new: true, runValidators: true }
                // )
                return res.status(201).send({
                    _id: data._id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    username: data.username,
                    birth: data.birth,
                    parent: data.parent,
                    // group: data.group,
                    tel: data.tel,
                    note: data.note
                });
            }
            )
            .catch((err) => {
                if (err.keyValue?.username) {
                    return res.status(409).json({
                        error: "conflictUsername",
                        message: "username already exist",
                    });
                } else {
                    return res.status(400).send({
                        error: err.message,
                        message: "Student cannot be inserted!",
                    });
                }
            });

    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: "serverSideError",
            message: "Server error!",
        });
    }
};

const PAGE_LIMIT = 10
//Retrieve all students
exports.findAllStudents = async (req, res) => {
    try {
        const { offset, group, section, firstName, lastName, absence } = req.query
        var filter = {}
        if (firstName) filter["firstName"] = { $regex: firstName, $options: 'i' }
        if (lastName) filter["lastName"] = { $regex: lastName, $options: 'i' }
        // if (absence) filter["absence"] = absence
        Student.find(filter, { password: 0 }).sort({ createdAt: -1 }).populate({ path: "group", populate: { path: "section" } })
            .then((students) => {
                if (!students) {
                    return res.status(204).send({
                        message: "There is no students in the database!",
                        found: false,
                    });
                }
                if (group) students = students.filter((element) => element.group?.groupName === group)
                if (section) students = students.filter((element) => element.group?.section?._id == section)
                var totalPages = Math.ceil(students.length / PAGE_LIMIT);
                students = students.slice(offset * PAGE_LIMIT, (offset * PAGE_LIMIT) + PAGE_LIMIT)
                return res.status(200).send({ students, found: true, totalPages });
            })
            .catch((err) => {
                console.log(err)
                return res.status(400).send({
                    error: err.message,
                    message: "Some error occured while retrieving all students!",
                });
            });
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: e.message,
            message: "Server error!",
        });
    }
};

//Retrieve all students with their parents data
exports.findAllStudentsWithParent = (req, res) => {
    try {
        Student.find({}, { password: 0 })
            .populate({ path: "parent", select: { password: 0 } })
            .then((students) => {
                if (students.length == 0) {
                    return res.status(204).send({
                        message: "There is no students in the database!",
                        found: false,
                    });
                }
                return res.status(200).send({ students, found: true });
            })
            .catch((err) => {
                return res.status(400).send({
                    error: err.message,
                    message: "Some error occured while retrieving all students!",
                });
            });
    } catch (e) {
        return res.status(500).send({
            error: e.message,
            message: "Server error!",
        });
    }
};

//Reetrieve Student by Id with his parent data
exports.findOneStudentWithParent = (req, res) => {
    try {
        if (!req.params.studentId) {
            return res.status(400).send({
                error: "Student id is required!",
            });
        }
        Student.findById(req.params.studentId, { password: 0 })
            .populate({ path: "parent", select: { password: 0 } })
            .then((student) => {
                if (student.length == 0) {
                    return res.status(404).send({
                        message:
                            "Student with the id:" + req.params.studentId + "not found!",
                        found: false,
                    });
                }
                return res.status(200).send({
                    student,
                    found: true,
                });
            })
            .catch((err) => {
                if (err.kind === "ObjectId") {
                    return res.status(404).send({
                        error: "Student not found with id: " + req.params.studentId,
                    });
                }
                return res.status(400).send({
                    error:
                        "Some Error while finding student with id" + req.params.studentId,
                });
            });
    } catch (e) {
        res.status(500).send({
            error: e.message,
            message: "Server error!",
        });
    }
};

//Reetrieve Student by Id
exports.findOneStudent = (req, res) => {
    try {
        if (!req.params.studentId) {
            return res.status(400).send({
                error: "Student id is required!",
            });
        }
        Student.findById(req.params.studentId, { password: 0 })
            .populate({ path: "group", select: { groupName: 1 } })
            .then((student) => {
                if (student.length == 0) {
                    return res.status(404).send({
                        message:
                            "Student with the id:" + req.params.studentId + "not found!",
                        found: false,
                    });
                }
                return res.status(200).send({
                    student,
                    found: true,
                });
            })
            .catch((err) => {
                if (err.kind === "ObjectId") {
                    return res.status(404).send({
                        error: "Student not found with id: " + req.params.studentId,
                    });
                }
                return res.status(400).send({
                    error:
                        "Some Error while finding student with id" + req.params.studentId,
                });
            });
    } catch (e) {
        res.status(500).send({
            error: e.message,
            message: "Server error!",
        });
    }
};

// Delete a Student with the specified studentId

exports.deleteStudent = (req, res) => {
    try {
        if (!req.params.studentId) {
            return res.status(400).send({
                error: "Bad Request!",
            });
        }
        const { studentId } = req.params;
        Student.findByIdAndRemove(studentId)
            .then((student) => {
                if (!student) {
                    return res.status(404).send({
                        message: "student not found with id " + studentId,
                        deleted: false,
                    });
                }
                return res.status(200).send({
                    message: "Student deleted Successfully!!",
                    deleted: true,
                });
            })
            .catch((err) => {
                if (err.kind === "ObjectId" || err.name === "NotFound") {
                    return res.status(404).send({
                        error: "Student not found with id" + studentId,
                    });
                }
                return res.status(400).send({
                    error: "Some Error occured while finding student with id" + studentId,
                });
            });
    } catch (e) {
        return res.status(500).send({
            error: e.message,
            message: "Server error!",
        });
    }
};

//login for the Student
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send({
                error: "Credentials required!",
            });
        }
        Student.findOne({ username })
            .populate({ path: "group", select: { groupName: 1 } })
            .then(async (student) => {
                if (student && (await bcrypt.compare(password, student.password))) {
                    const token = generateToken(
                        {
                            firstName: student.firstName,
                            lastName: student.lastName,
                            username: student.username,
                            birth: student.birth,
                        },
                        "3d"
                    );
                    return res.status(200).json({ logged: true, token });
                } else {
                    return res.status(404).json({ logged: false });
                }
            })
            .catch((err) => {
                if (err.kind === "ObjectId" || err.name == "NotFound") {
                    return res.status(404).send({
                        error: "Student with username:" + username + " not found!",
                    });
                }
                console.log(err.message);
                return res.status(400).send({
                    error: "Some error occured while student attempting to Log in!",
                });
            });
    } catch (e) {
        return res.status(500).send({
            error: e.message,
            message: "Server error!",
        });
    }
};

// update student by id
exports.updateStudent = async (req, res) => {
    try {
        if (!req.params.studentId) {
            return res.status(400).send({
                error: "Bad Request",
            });
        }
        if (req.body.password) {
            if (req.body.password.length < 6) {
                return res.status(400).send({
                    error: "password Length should be >= 6",
                });
            } else {
                req.body.password = await bcrypt.hash(req.body.password, 10);
            }
        }
        // assuming that the request body have the same database attributes name
        Student.findByIdAndUpdate(req.params.studentId, req.body, {
            new: true,
            runValidators: true,
            fields: { password: 0 },
        })
            .then((student) => {
                if (!student) {
                    return res.status(404).send({
                        message: "Student with id: " + req.params.studentId + " not found",
                        updated: false,
                    });
                }
                return res.status(200).send({
                    updated: true,
                });
            })
            .catch((err) => {
                console.log(err)
                if (err.kind === "ObjectId" || err.name === "NotFound") {
                    return res.status(404).send({
                        error: "Student with id: " + req.params.studentId + " not found",
                    });
                }
                if (err.keyValue?.username) {
                    return res.status(409).send({
                        error: "ConflictUsername",
                        message: "Username already exist!",
                    });
                }
                return res.status(400).send({
                    error:
                        "Some Error occured while updating the student with id : " +
                        req.params.studentId,
                });
            });
    } catch (e) {
        return res.status(500).send({
            error: e.message,
            message: "Server error!",
        });
    }
};

exports.permutationStudent = async (req, res) => {
    try {
        const { studentId, groupId } = req.params;
        const student = await Student.findByIdAndUpdate(
            studentId,
            { group: groupId },
            { new: false, runValidators: true }
        ).populate({ path: "group", select: { groupName: 1 } });
        const RemovedStduentFromOldGroup = await Group.findByIdAndUpdate(
            student.group._id,
            { $pull: { students: studentId } },
            { new: true, runValidators: true }
        )
        const group = await Group.findByIdAndUpdate(
            groupId,
            { $push: { students: new Types.ObjectId(studentId) } },
            { new: true, runValidators: true }
        )
        return student
            ? res.status(200).json({
                updated: true,
                student
            })
            : res.status(404).json({
                updated: false,
            })
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            error: "serverSideError",
        });
    }
};

exports.graduationStudent = async (req, res) => {
    try {
        const { studentId, groupId } = req.params
        const student = await Student.findByIdAndUpdate(
            studentId,
            { group: groupId },
            { new: true, runValidators: true }
        ).populate({ path: "group", select: { groupName: 1 } })
        const group = await Group.findByIdAndUpdate(
            groupId,
            { $push: { students: new Types.ObjectId(studentId) } },
            { new: true, runValidators: true }
        )
        return student ?
            res.status(200).send({
                updated: true,
                student
            })
            :
            res.status(404).send({
                updated: false
            })
    } catch (e) {
        return res.status(500).send({
            error: e.error,
            message: "Server ERROR!"
        })
    }
}
