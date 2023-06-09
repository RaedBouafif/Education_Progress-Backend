const GroupModel = require("../models/group.model");
const StudentModel = require("../models/Users/student.model")
const TemplateModel = require("../models/template.model")
const CollegeYear = require("../models/collegeYear.model")
const { Types } = require('mongoose')

function groupStudents(arr) {
    let result = [];
    arr.forEach(obj => {
      let group = result.find(item => item.groupId === obj.groupId);
  
      if (group) {
        group.students.push(obj.student);
      } else {
        result.push({ groupId: obj.groupId, students: [obj.student] });
      }
    });
  
    return result;
}
  
exports.create = async (req, res) => {
    var students =  JSON.parse(req.body.students)
    try {
        var group = await GroupModel.create({
            groupName: req.body.groupName,
            section: req.body.section,
            collegeYear: req.body.collegeYear,
            students: students?.map( (element) => element._id ) || null,
            note: req.body.note || null
        });
        group = await group.save()
        group = await GroupModel.populate(group, [{ path: "section", },{path : "students", select : { pasword : 0}}])
        const template = await TemplateModel.create({
            group: group._id,
            collegeYear: req.body.collegeYear,
        })
        await template.save()
        if (students) {
            students.map( element => element._id ).forEach(async (element) => {
                await StudentModel.findByIdAndUpdate(Types.ObjectId(element), { group: group._id }, { runValidators: true, new: true })
            })
            const newStudentsWithGroups = students.filter( element => element.group ).map( element => ({student : element._id, groupId : element.group }))
            const lastStudentsWithGroups = groupStudents(newStudentsWithGroups)
            console.log(lastStudentsWithGroups)
            lastStudentsWithGroups.forEach( async currentGroupWithStudents => {
                var gp = await GroupModel.findById(new Types.ObjectId(currentGroupWithStudents.groupId))
                gp.students = gp?.students.filter((element)=>!currentGroupWithStudents.students.includes(element.toString()))
                await gp.save()
            })
        }   
        return res.status(201).json(group);
    } catch (e) {
        console.log(e);
        if (e.code === 11000) {
            return res.status(409).json({
                error: "conflictGroup",
                message: "group already used in this year",
            });
        }
        else if (e.errors?.collegeYear?.properties?.message === "collegeYearRequired") {
            return res.status(400).json({
                error: "collegeYearRequired",
            });
        }
        else if (e.errors?.groupName?.properties?.message === "groupNameRequired") {
            return res.status(400).json({
                error: "groupNameRequired",
            });

        } else if (e.errors?.section?.properties?.message === "sectionRequired") {
            return res.status(400).json({
                error: "sectionRequired",
            });
        } else if (
            e.errors?.section?.properties?.message ||
            e.errors?.groupName?.properties?.message
        ) {
            return res.status(400).json({
                error: "badRequest",
            });
        } else
            return res.status(500).json({
                error: "serverSideError",
            });
    }
};

exports.getAll = async (req, res) => {
    try {
        if (!req.params.yearId) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        const groups = await GroupModel.find({ collegeYear: new Types.ObjectId(req.params.yearId) })
            .populate("collegeYear")
            .populate("section")
            .populate("students")
        return groups.length
            ? res.status(200).json({ found: true, groups })
            : res.status(204).json({ found: false });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            error: "serverSideError",
        });
    }
};

exports.getAllGroups = async (req, res) => {
    try {
        const { collegeYearId } = req.params
        const groups = await GroupModel.find({ collegeYear: collegeYearId }).populate("students").populate({ path: "section", populate: { path: "subjects", select: { image: 0 } } }).populate("collegeYear");
        return groups.length
            ? res.status(200).json({ found: true, groups })
            : res.status(204).json({ found: false });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            error: "serverSideError",
        });
    }
};
exports.getById = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await GroupModel.findById(groupId).populate("section").populate("students");
        return group
            ? res.status(200).json({ found: true, group })
            : res.status(404).json({ found: false });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            error: "serverSideError",
        });
    }
};


exports.update = async (req, res) => {
    try {
        const { groupId } = req.params
        const group = await GroupModel.findByIdAndUpdate(groupId,
            req.body
            ,
            {
                new: true,
                runValidators: true
            }
        )
        return group ? res.status(200).json({ found: true, group }) : res.status(404).json({ found: false })
    }
    catch (e) { 
        console.log(e);
        if (e.code === 11000) {
            return res.status(409).json({
                error: "conflictGroup",
                message: "group already used in this year",
            });
        }
        else if (e.errors?.section?.properties?.message || e.errors?.groupName?.properties?.message) {
            return res.status(400).json({
                error: "badRequest",
            });
        } else
            return res.status(500).json({
                error: "serverSideError",
            });
    }
}


exports.deleteById = async (req, res) => {
    try {
        const { groupId } = req.params
        const group = await GroupModel.findByIdAndDelete(groupId)
        if (group)
            return res.status(200).json({
                found: true
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



// need to handle this from back
exports.addStudent = async (req, res) => {
    try {
        const { studentId, groupId } = req.params
        const group = await GroupModel.findById(groupId)
        if (!group) return res.status(404).json({
            error: "groupNotFound"
        })
        const student = await StudentModel.findByIdAndUpdate(studentId, { group: group._id }, { runValidators: true, new: true })
        if (!student) return res.status(404).json({
            error: "studentNotFound"
        })
        if (group.students?.find((element) => element.toString() == studentId)) return res.status(409).json({ error: "studentConflict" })
        if (group?.students){
            group.students.push(new Types.ObjectId(studentId))
        }else{
            group.students = [ new Types.ObjectId(studentId)]
        }
        await group.save()
        return res.status(201).json({
            success: true
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            error: "serverSideError"
        })
    }
}



exports.deleteStudent = async (req, res) => {
    try {
        const { studentId, groupId } = req.params
        const group = await GroupModel.findById(groupId)
        if (!group) return res.status(404).json({
            error: "groupNotFound"
        })
        const student = await StudentModel.findByIdAndUpdate(studentId, { group: null }, { runValidators: true, new: true })
        if (!student) return res.status(404).json({
            error: "studentNotFound"
        })
        if (!group.students?.find((element) => element == studentId)) return res.status(404).json({ error: "studentNotInGroup" })
        group.students = group.students.filter((element) => element != studentId)
        await group.save()
        return res.status(200).json({
            success: true
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            error: "serverSideError"
        })
    }
}


exports.countDocsss = async (req, res) => {
    try {
        const countGroups = await GroupModel.countDocuments()
        return res.status(200).send({ number: countGroups || 0 })
    } catch (e) {
        return res.status(500).send({
            error: "Server Error!"
        })
    }
}



// return all the subjects assigned to the group given 
// tested and woriking 
exports.findAllAvailableSubjects = async (req, res) => {
    try {
        const groupId = req.params.groupId
        if (!groupId) {
            return res.status(400).send({
                error: "BadRequest"
            })
        }
        const group = await GroupModel.findById(groupId, 'section')
            .populate({ path: "section", select: "subjects", populate: { path: "subjects", select: "subjectName" } })
        if (!group) {
            return res.status(404).send({
                error: "Group not found"
            })
        } else {
            return res.status(200).send(group)
        }
    } catch (e) {
        console.log(e)
        if (e.code === 1100) {
            return res.status(409).send({
                error: "conflictFind"
            })
        }
        return res.status(500).send({
            error: "Server Error"
        })
    }
}



exports.getNumberStudentsPerYear = async (req,res) => {
    try{
        var group = await GroupModel.find({}).populate({path: "collegeYear", select: "year"})
        if (!group){
            return res.status(204).send({
                message : "NO groups yet"
            })
        }
        function groupStudentsByYear(arr) {
        const groupedByYear = {};
        arr.forEach(obj => {
            const year = obj.collegeYear?.year;
            const studentsCount = obj.students.length;
        
            if (groupedByYear[year]) {
            groupedByYear[year] += studentsCount;
            } else {
            groupedByYear[year] = studentsCount;
            }
        });
        
        const result = [];
        
        for (const year in groupedByYear) {
            result.push({ year: year, students: groupedByYear[year] });
        }
        return result;
        }
        var finalData = groupStudentsByYear(group)
        const lastOne = finalData.filter(element => element.year != 'undefined')
        return res.status(200).send(lastOne)
    }catch(e) {
        console.log(e)
        return res.status(500).send({
            error : e.message,
            message: "Server Eroor"
        })
    }
}