const { Schema, model } = require("mongoose")




const teacherAbsence = Schema(
    {
        teacher: {
            type: Schema.Types.ObjectId,
            ref: "Teacher"
        },
        session: {
            type: Schema.Types.ObjectId,
            ref: "Session"
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