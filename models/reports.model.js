const { model , Schema, Types } = require("mongoose")

const Reports = Schema({
    student : {
        type : Schema.Types.ObjectId,
        ref : "Student"
    },
    session : {
        type : Schema.Types.ObjectId,
        ref : 'Session'
    },
    content : {
        type : String
    },
    type : {
        type : String
    },
    teacher : {
        type : Schema.Types.ObjectId,
        ref : "Teacher",
    },
    groups : [{
        type : Schema.Types.ObjectId,
        ref : "Group"
    }],
    sections : [{ 
        type : Schema.Types.ObjectId,
        ref : "Section"
    }],
    justified : {
        type: Boolean
    },
    sender : {
        type : Object,
        id : String,
        senderType : {
            type : String,
            enum: ['teacher', 'student', 'admin'],
        },
        senderFirstName : {
            type : String
        },
        senderLastName: {
            type: String
        }
    }
})

module.exports = model("Reports", Reports)


