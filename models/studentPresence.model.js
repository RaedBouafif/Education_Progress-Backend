const { Schema, model } = require("mongoose")



const StudentPresence = Schema(
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
        group : {
            type : Schema.Types.ObjectId,
            ref : "Group",
            required: [true, "groupRequired"]
        },
        dateEntry: {
            type: Number,
        },
        dateLeave: {
            type: Number,
        },
        extra : {
            type: Boolean
        },
        collegeYear : {
            type : Schema.Types.ObjectId,
            ref: "CollegeYear",
            required : [true, "collegeYearRequired"]
        },
        active : {
            type : Boolean
        }
        //createdDate to know in which week this session
    },
    {
        timestamps: true
    }
)
//must add index with only date(using createdAt) student and session
//+ error handling for unique
StudentPresence.virtual('createdAtDate').get(function () {
    return this.createdAt.toISOString().substr(0, 10)
})

StudentPresence.index({ student: 1, session: 1}, { unique: true })
module.exports = model("StudentPresence", StudentPresence)