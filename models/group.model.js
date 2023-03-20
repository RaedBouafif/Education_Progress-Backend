
const { Schema, model } = require("mongoose")


const Group = Schema(
    {
        groupName: {
            type: String,
            required: [true, "groupNameRequired"],
            trim: true
        },
        section: {
            type: Schema.Types.ObjectId,
            ref: "Section",
            required: [true, "sectionRequired"]
        },
        collegeYear: {
            type: Schema.Types.ObjectId,
            ref: "CollegeYear",
            required: [true, "collegeYearRequired"]
        },
        students: [{
            type: Schema.Types.ObjectId,
            ref: "Student",
        }],
        note : {
            type : String
        }
    },
    {
        timestamps: true
    }
)
Group.index({ groupName: 1, section: 1, collegeYear: 1 }, { unique: true })
module.exports = model("Group", Group)