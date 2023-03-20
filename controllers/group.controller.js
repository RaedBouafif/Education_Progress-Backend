const GroupModel = require("../models/group.model");
const  { Types } = require('mongoose')
exports.create = async (req, res) => {
    try {
        const group = await GroupModel.create(req.body);
        await group.save();
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
                error : "BadRequest"
            })
        }
        const groups = await GroupModel.find({ collegeYear : new Types.ObjectId(req.params.yearId)})
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
        const groups = await GroupModel.find({ collegeYear: collegeYearId }).populate("students").populate("section").populate("collegeYear");
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
            {
                groupName: req.body.groupName
            },
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
