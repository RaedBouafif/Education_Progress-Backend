const { Schema, model } = require("mongoose")

const Session = Schema(
    {
        teacher: {
            type: Schema.Types.ObjectId,
            ref: "Teacher",
            requried: [true, "teacherRequired"]
        },
        classroom: {
            type: Schema.Types.ObjectId,
            ref: "Classroom",
            required: [true, "classRoom Required!"]
        },
        subject: {
            type: Schema.Types.ObjectId,
            ref: "Subject",
            required: [true, "subjectRequired"]
        },
        group: {
            type: Schema.Types.ObjectId,
            ref: "Group",
        },
        startAt: {
            type: Date,
            required: [true, "startAtRequired"]
        },
        duration: {
            type: Date,
            required: [true, "durationRequired"],
        },
        active: {
            type: Boolean,
            default: true
        }
        //typeSession : ostedh
    },
    {
        timestamps: true,
    }
)

module.exports = model("Session", Session) 