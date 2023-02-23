const { Schema, model, Types } = require("mongoose")

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
        day : {
            type : Number,
            required : [true, "dayRequired"],
            min : [0, "minDayException"],
            max : [6 , "maxDayException"]
        },
        startsAt: {
            type: Number, 
            required: [true, "startAtRequired"]
        },
        endsAt: {
            type: Number,
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
            enum: ['manual', 'template'],
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

// Session.index({ teacher : 1, group : 1, startsAt : 1}, {unique : true})
Session.statics.getDistinctLatest = async function(group , categorie){

        return await this.aggregate([
            {$sort: { "createdAt": -1 }},
            {$match : {group : new Types.ObjectId(group) ,sessionCategorie : categorie }},
            {
                $group: {
                    _id: { day: "$day", startsAt: "$startsAt" },
                    doc: { $first: "$$ROOT" } 
                },
            },
            // to project the docs ( if i need all the data)
            // {
            //     $project: {
            //         docs: 1
            //     }
            // }
            {
                $replaceRoot : {
                    newRoot :  "$doc"
                }
            }
        ])  
}   

module.exports = model("Session", Session) 

