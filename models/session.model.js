const { ObjectId } = require("mongodb")
const { Schema, model } = require("mongoose")

const Session = Schema(
    {
        teacher: {
            type: Schema.Types.ObjectId,
            ref: "Teacher",
            required: [true, "teacherRequired"]
        },
        classroom: {
            type: Schema.Types.ObjectId,
            ref: "Classroom",
            required: [true, "classroomRequired"]
        },
        subject: {
            type: Schema.Types.ObjectId,
            ref: "Subject",
            required: [true, "subjectRequired"]
        },
        group: {
            type: Schema.Types.ObjectId,
            ref: "Group",
            required : [true, "groupRequired"]
        },
        startsAt: {
            type: Date,
            required: [true, "startAtRequired"]
        },
        endsAt: {
            type: Date,
            required: [true, "endsAtRequired"]
        },
        sessionType: {
            type: String,
            required: [true, "sessionTypeRequired"],
            enum: ['TP', 'COUR']
        },
        sessionCategorie: {
            type: String,
            required: [true, "sessionCategorieRequired"],
            enum: ['Manual', 'Template'],
        },
        active: { 
            type: Boolean,
            default: true
        },
        createdBy : {
            type : Schema.Types.ObjectId,
            ref: "Admin",
            required : [true, "createdByRequired"]
        },
        modifiedBy : {
            type : String
        }
    },
    {
        timestamps: true,
    }
)

Session.index({ teacher : 1, group : 1, startsAt : 1}, {unique : true})

module.exports = model("Session", Session) 

