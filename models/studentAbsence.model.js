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
        }
    },
    {
        timestamps: true
    }
)


module.exports = model("StudentAbsence", StudentAbsence)