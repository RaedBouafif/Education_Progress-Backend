const { Types, Schema, model} = require("mongoose")

const Logs = Schema({
    user : {
        userId: {
            type : Types.ObjectId,
            refPath : "user.userPath"
        },
        userPath: {
            type: String,
            enum : ["Admin", "Student", "Teacher", "Parent"]
        }
    },
    model : {
        modelId: {
            type : Types.ObjectId,
            refPath : "model.modelPath"
        },
        modelPath: {
            type: String,
            enum : ["Admin", "Student", "Teacher", "Parent", "Classroom", "CollegeYear", "Group", "Message", "Notification", "Planning", "Reports", "Rates", "Section", "Semester", "Session", "SessionLogsSchema", "StudentAbsence", "StudentPresence", "Subject", "teacherAbsence", "Template"]
        }
    },
    action : {
        type: String,
    }
},
    {
        timestamps: true
    }
)

module.exports = model("Logs", Logs)