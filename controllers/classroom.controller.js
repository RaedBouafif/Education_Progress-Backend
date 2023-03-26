const ClassroomModel = require("../models/classroom.model");
const Template = require("../models/template.model")
const Session = require("../models/session.model")
const { Types } = require('mongoose')

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
        const classroom = await ClassroomModel.findByIdAndDelete(classroomId)
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
    try {
        const countClasses = await ClassroomModel.countDocuments()
        return res.status(200).send({ number: countClasses || 0 })
    } catch (e) {
        return res.status(500).send({
            error: "Server Error!"
        })
    }
}





exports.findAvailableClassroms = async (req,res) => {
    try{
        const { startsAt, endsAt, day, collegeYear } = req.body
        if (!startsAt || !endsAt || !day || !collegeYear){
            return res.status(400).send({
                error : "BadRequest"
            })
        }
        const classrooms = await ClassroomModel.find({})
        if(!classrooms){
            return res.status(400).send({
                error : "NoClassrooms"
            })
        }
        var OccupiedClassrooms = await Template.find({collegeYear : collegeYear}, 'sessions').populate({ path : 'sessions', match : { startsAt : startsAt , endsAt : endsAt , day : day, collegeYear : collegeYear}})
        OccupiedClassrooms = OccupiedClassrooms?.filter((element) => Array.isArray(element.sessions) && element.sessions.length).length ? OccupiedClassrooms?.filter((element) => Array.isArray(element.sessions)) : []
        if (OccupiedClassrooms.length > 1){
            OccupiedClassrooms = OccupiedClassrooms.reduce((a, b, index) => index !== 1 ? [...a, ...b.sessions] : [...a.sessions, b.sessions]).map((element) => element.classroom?.toString()) || []
        }
        else if (OccupiedClassrooms.length === 1) {
            OccupiedClassrooms = [OccupiedClassrooms[0].classroom.toString()]
        }
        console.log(OccupiedClassrooms)
        if (!OccupiedClassrooms.length) {
            return res.status(200).json(classrooms)
        } else {
            return res.status(200).json(classrooms.filter((element) => OccupiedClassrooms.indexOf(element._id.toString()) === -1))
        }
    }catch(e){
        console.log(e)
        return res.status(500).send({
            error : "Server Error"
        })
    }
}

//available classrooms in the date given
//need test
// exports.findAvailableClassroms = async (req, res) => {
//     try {
//         const { startsAt, endsAt, day, collegeYear } = req.body
//         console.log(req.body)
//         if (!startsAt || !endsAt || !day || !collegeYear) {
//             return res.status(400).send({
//                 error: "BadRequest"
//             })
//         }
//         //get all classrooms
//         const classrooms = await ClassroomModel.find({})
//         if (!classrooms) {
//             return res.status(400).send({
//                 message: "NoClassrooms",
//                 found: false
//             })
//         } else {
//             const classroomIds = []
//             for (let i = 0; i < classrooms.length; i++) {
//                 classroomIds[i] = classrooms[i]._id
//             }
//             var OccupiedClassrooms = await Template.find({ collegeYear: new Types.ObjectId(collegeYear) }, 'sessions').populate({ path: "sessions", match: { startsAt: startsAt, endsAt: endsAt, day: day } })
//             console.log(OccupiedClassrooms)
//             if (!OccupiedClassrooms) {
//                 return res.status(400).send({
//                     message: "College Year does not exist"
//                 })
//             } else {
//                 const sessions = OccupiedClassrooms.map((element, index) => {
//                     return element.sessions
//                 })
//                 if (sessions.length === 0) {
//                     return res.status(200).send(classrooms.sort((a, b) => {
//                         if (a.classroomName.toLowerCase() > b.classroomName.toLowerCase()) return 1
//                         else return -1
//                     }))
//                 } else {
//                     var finalArray = []
//                     for (let i = 0; i < sessions.length; i++) {
//                         var x1 = classrooms.filter((element) => element._id != sessions[i].classroom)
//                         finalArray = [...finalArray, x1]
//                     }
//                     const distinctClassrooms = finalArray.filter(function (obj, index, self) {
//                         return index === self.findIndex(function (o) {
//                             return JSON.stringify(o) === JSON.stringify(obj);
//                         });
//                     });
//                     return res.status(200).send(distinctClassrooms[0].sort((a, b) => {
//                         if (a.classroomName.toLowerCase() > b.classroomName.toLowerCase()) return 1
//                         else return -1
//                     }))
//                 }
//             }
//         }
//     } catch (e) {
//         console.log(e)
//         return res.status(500).send({
//             error: "Server Error"
//         })
//     }
// }