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
        dateEntry: {
            type: Date,
        },
        dateLeave: {
            type: Date,
        },
        //createdDate to know in which week this session
    },
    {
        timestamps: true
    }
)


module.exports = model("StudentPresence", StudentPresence)