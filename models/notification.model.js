const { Types, Schema, model } = require("mongoose")

const Notification = Schema({
    receivers: [{
        type: Object,
        receiverId: {
            type: Types.ObjectId
        },
        receiverPath: {
            type: String,
            enum: ["Student", "Parent", "Teacher", "Admin"]
        }
    }],
    sender: {
        type: Object,
        senderId: {
            type: Types.ObjectId
        },
        senderPath: {
            type: String,
            enum: ["Student", "Parent", "Teacher", "Admin"]
        }
    },
    studentAbsence: {
        type: Types.ObjectId,
        ref: "StudentAbsence"
    },
    teacherAbsence: {
        type: Types.ObjectId,
        ref: "TeacherAbsence"
    },
    content: {
        type: String
    },
    object: {
        type: String
    },
    report: {
        type: Types.ObjectId,
        ref: "Reports"
    },
    notificationType: {
        type: String,
        enum: ["newSession", "updateSession", "presence", "absence", "report", "catchupSession", "cancelSession"]
    },
    session: {
        type: Types.ObjectId,
        ref: "Session"
    }
})

module.exports = model("Notification", Notification)