const { Types, Schema, model, Document} = require("mongoose")

const Notification = Schema({
    receivers: [{
        type: Object,
        receiverId: {
            type: Types.ObjectId,
            refParh : "receivers.receiverPath"
        },
        receiverPath: {
            type: String,
            enum: ["Student", "Parent", "Teacher", "Admin", "Group", "Section"]
        }
    }],
    sender: {
        senderId: {
            type: Types.ObjectId,
            refPath: "sender.senderPath"
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
        enum: ["newSession", "updateSession", "teacherAbsence", "studentAbsence", "teacherAbsenceDeclared", "studentAbsenceDeclared", "report", "catchupSession", "cancelSession", "exclu", "exam", "event", "meeting", "nonStartedSession", "homework", "coursContent", "evaluation" ]
    },
    session: {
        type: Types.ObjectId,
        ref: "Session"
    },
    seen : {
        type : Boolean,
        default : false
    },
    active: {
        type: Boolean
    }
},
{
    timestamps: true
}
)

// const Notification = Schema({
//     receivers: [{
//         type: {
//             type: String,
//             enum: ["Student", "Parent", "Teacher", "Admin"]
//         },
//         receiverId: {
//             type: Types.ObjectId,
//             refPath: 'receivers.type'
//         },
//     }],
//     sender: {
//         type: {
//             type : String,
//             enum: ["Student", "Parent", "Teacher", "Admin"]
//         },
//         senderId: {
//             type: Types.ObjectId,
//             refPath: 'sender.type'
//         },
//     },
//     studentAbsence: {
//         type: Types.ObjectId,
//         ref: "StudentAbsence"
//     },
//     teacherAbsence: {
//         type: Types.ObjectId,
//         ref: "TeacherAbsence"
//     },
//     content: {
//         type: String
//     },
//     object: {
//         type: String
//     },
//     report: {
//         type: Types.ObjectId,
//         ref: "Reports"
//     },
//     notificationType: {
//         type: String,
//         enum: ["newSession", "updateSession", "absence", "report", "catchupSession", "cancelSession"]
//     },
//     session: {
//         type: Types.ObjectId,
//         ref: "Session"
//     },
//     seen : {
//         type : Boolean,
//         default : false
//     }
// })

module.exports = model("Notification", Notification)