const { model, Schema, Types } = require("mongoose")

const Reports = Schema({
    students: [{
        type: Schema.Types.ObjectId,
        ref: "Student"
    }],
    session: {
        type: Schema.Types.ObjectId,
        ref: 'Session'
    },
    content: {
        type: String
    },
    object: {
        type: String
    },
    type: {
        type: String
    },
    teachers: [{
        type: Schema.Types.ObjectId,
        ref: "Teacher",
    }],
    parents: [{
        type: Schema.Types.ObjectId,
        ref: "Parent",
    }],
    groups: [{
        type: Schema.Types.ObjectId,
        ref: "Group"
    }],
    sections: [{
        type: Schema.Types.ObjectId,
        ref: "Section"
    }],
    justified: {
        type: Boolean
    },
    sender: {
        type: Object,
        id: String,
        senderType: {
            type: String,
            enum: ['teacher', 'student', 'admin'],
        },
        senderFirstName: {
            type: String
        },
        senderLastName: {
            type: String
        }
    }
},
    {
        timestamps: true
    }
)

module.exports = model("Reports", Reports)


