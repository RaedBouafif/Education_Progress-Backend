const classroomModel = require("../models/classroom.model");
const ClassroomModel = require("../models/classroom.model");

exports.create = async (req, res) => {
    try {
        const classroom = await ClassroomModel.create(req.body);
        await classroom.save();
        return res.status(201).json({ classroom });
    } catch (e) {
        console.log(e);
        if (e.keyValue?.classroomName) {
            return res.status(409).json({
                error: "conflictClassroomName",
                message: "Classroom Name already used",
            });
        } else if (e.errors?.classroomName?.properties.message === "classroomNameRequired") {
            return res.status(400).json({
                error: "classroomNameRequired",
                message: "Classroom Name is required",
            });
        }
        else if (e.errors?.type?.kind === "enum") {
            return res.status(400).json({
                error: "typeClassroomEnum",
                message: "classroom type can be only 'COUR' or 'TP' ",
            });
        } else if (e.errors?.classroomName?.properties || e.errors?.type?.properties) {
            return res.status(400).json({
                error: "badRequest",
            });
        } else {
            return res.status(500).json({
                error: "serverSideError",
            });
        }
    }
};

exports.getAll = async (req, res) => {
    try {
        const classrooms = await ClassroomModel.find({});
        return classrooms.length
            ? res.status(200).json({ found: true, classrooms })
            : res.status(204).json({ found: false });
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            error: "serverSideError",
        });
    }
};


exports.deleteById = async (req, res) => {
    try {
        const { classroomId } = req.params
        const classroom = await classroomModel.findByIdAndDelete(classroomId)
        if (classroom)
            return res.status(200).json({
                found: true, classroom
            });
        else
            return res.status(404).json({
                found: false,
            });
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            error: "serverSideError",
        });
    }

}



exports.getById = async (req, res) => {
    try {
        const { classroomId } = req.params
        const classroom = await ClassroomModel.findById(classroomId)
        return classroom ? res.status(200).json({ found: true, classroom }) : res.status(404).json({ found: false })
    } catch (e) {
        return res.status(500).json({
            error: "serverSideError",
        });
    }
}


exports.update = async (req, res) => {
    try {
        const classroom = await ClassroomModel.findByIdAndUpdate(
            req.params.classroomId, req.body,
            { new: true, runValidators: true }
        )
        if (classroom) return res.status(200).json({ found: true, classroom })
        else return res.status(404).json({ found: false })
    } catch (e) {
        if (e.keyValue?.classroomName) {
            return res.status(409).json({
                error: "conflictClassroomName",
                message: "Classroom Name already used",
            });
        }
        else if (e.errors?.type?.kind === "enum") {
            return res.status(400).json({
                error: "typeClassroomEnum",
                message: "classroom type can be only 'COUR' or 'TP' ",
            });
        } else if (e.errors?.classroomName?.properties || e.errors?.type?.properties) {
            return res.status(400).json({
                error: "badRequest",
            });
        } else {
            return res.status(500).json({
                error: "serverSideError",
            });
        }
    }
}