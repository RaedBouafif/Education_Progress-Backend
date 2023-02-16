const { Schema, model } = require("mongoose")



const StudentAbsence = Schema(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: "Student"
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


module.exports = model("StudentAbsence", StudentAbsence)