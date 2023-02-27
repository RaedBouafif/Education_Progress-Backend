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


module.exports = model("StudentAbsence", StudentAbsence)