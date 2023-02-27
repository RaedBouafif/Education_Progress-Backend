const { Schema, model } = require("mongoose")

const teacherAbsence = Schema(
    {
        teacher: {
            type: Schema.Types.ObjectId,
            ref: "Teacher",
            required: [true, "teacherRequired"]
        },
        session: {
            type: Schema.Types.ObjectId,
            ref: "Session",
            required: [true, "sessionRequired"]
        },
        date : {
            type : Date
        },
        justified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)


module.exports = model("TeacherAbsence", teacherAbsence)