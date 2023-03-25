const classroomModel = require("../models/classroom.model");
const ClassroomModel = require("../models/classroom.model");
const Template = require("../models/template.model")
const  { Types } = require('mongoose')

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
        const classrooms = await ClassroomModel.find({})
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


exports.countDocsss = async (req, res) => {
    try{
        const countClasses = await ClassroomModel.countDocuments()
        return res.status(200).send({number : countClasses || 0})
    }catch(e) {
        return res.status(500).send({
            error : "Server Error!"
        })
    }
}


//available classrooms in the date given
//need test
exports.findAvailableClassroms = async (req,res) => {
    try{
        const { startsAt, endsAt, day, collegeYear } = req.body
        if (!startsAt || !endsAt || !day || !collegeYear){
            return res.status(400).send({
                error : "BadRequest"
            })
        }
        //get all classrooms
        const classrooms = ClassroomModel.findAll({})
        if (!classrooms){
            return res.status(400).send({
                message : "NoClassrooms",
                found: false
            })
        }else{
            const classroomIds = []
            for ( let i = 0 ; i < classrooms.length ; i++){
                classroomIds[i] = classrooms[i]._id
            }
            const OccupiedClassrooms = await Template.find({collegeYear : new Types.ObjectId(collegeYear)}, 'sessions')
            .populate({ $path : "sessions", match : { startsAt : startsAt , endsAt : endsAt , day: day }, select : { classroom : 1} })
            if (!OccupiedClassrooms){
                return res.status(200).send({ 
                    classrooms
                })
            }else{
                for (let x = 0 ; x < OccupiedClassrooms.sessions.length ; x++){
                    const index = classroomIds.indexOf(OccupiedTeachers.sessions.classroom) 
                    if ( index > -1){
                        classrooms.splice(index, 1)
                    }
                }
                return res.status(200).send(classrooms)
            }
        }
    }catch(e){
        return res.status(500).send({
            error: "Server Error"
        })
    }
}