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
        dateEntry: {//memorization
            type: Date,
        },
        dateLeave: {//memorization
            type: Date,
        }
    },
    {
        timestamps: true
    }
)


module.exports = model("StudentPresence", StudentPresence)