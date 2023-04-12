const { Schema, model } = require("mongoose")



const StudentAbsence = Schema(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: [true, "studentRequired"]
        },
        session: {
            type: Schema.Types.ObjectId,
            ref: "Session",
            required: [true, "sessionRequired"]
        },
        //createdAt can identify the week
        justified: { // justified by admin
            type: Boolean,
            default: false
        },
        group : {
            type : Schema.Types.ObjectId,
            ref : "Group",
            required: [true, "groupRequired"]
        },
        collegeYear : {
            type : Schema.Types.ObjectId,
            ref: "CollegeYear",
            required : [true, "collegeYearRequired"]
        }
    },
    {
        timestamps: true
    }
)

//must add index with only date(using createdAt) student and session
//+error handling for unique
StudentAbsence.virtual('createdAtDate').get(function () {
    return this.createdAt.toISOString().substr(0, 10)
})

StudentAbsence.index({ student: 1, session: 1, createdAtDate: 1 }, { unique: true })
module.exports = model("StudentAbsence", StudentAbsence)