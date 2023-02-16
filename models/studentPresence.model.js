const { Schema, model } = require("mongoose")



const StudentPresence = Schema(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: "Student"
        },
        session: {
            type: Schema.Types.ObjectId,
            ref: "Session"
        }
    },
    {
        timestamps: true
    }
)


module.exports = model("StudentPresence", StudentPresence)