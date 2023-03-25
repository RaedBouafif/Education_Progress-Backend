const { model, Schema } = require("mongoose")

const Template = Schema({
    group: {
        type: Schema.Types.ObjectId,
        ref: "Group",
        required: [true, "groupRequired"],
    },
    collegeYear: {
        type: Schema.Types.ObjectId,
        ref: "CollegeYear",
        required: [true, "collegeYearRequired"]
    },
    sessions: [{
        type: Schema.Types.ObjectId,
        ref: "Session",
    }],
    active: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true
    })

Template.index({ group: 1, collegeYear: 1 }, { unique: true })

module.exports = model("Template", Template)



