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
            required: [true, "groupRequired"]
        },
        day: {
            type: Number,
            required: [true, "dayRequired"],
            min: [0, "minDayException"],
            max: [6, "maxDayException"]
        },
        startsAt: {
            type: Number,
            required: [true, "startAtRequired"]
        },
        endsAt: {
            type: Number,
            required: [true, "endsAtRequired"]
        },
        startedAt: {
            type: Date
        },
        endedAt: {
            type: Date
        },
        rates: [
            {
                studentName: {
                    type: String
                },
                value: {
                    type: Number,
                    min: [0, "InvalidRate"],
                    max: [5, "InvalidRate"]
                }
            }
        ],
        reports: [
            {
                studentName: {
                    type: String
                },
                description : {
                    type : String
                },
                justifiedReports: {
                    type: Boolean,
                    default: false
                }
            }
        ],
        sessionType: {
            type: String,
            required: [true, "sessionTypeRequired"],
            enum: ['TP', 'COUR']
        },
        active: {
            type: Boolean,
            default: true
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "Admin",
        },
        modifiedBy: {
            type: String
        },
        canceled: {
            type: Boolean,
            default: false
        },
        delaid : {
            type: Boolean,
            default: false
        },
        duration : {
            type : Number,
            dafault : 1
        }
    },
    {
        timestamps: true,
    }
)

// Session.index({ teacher : 1, group : 1, startsAt : 1}, {unique : true})
Session.statics.getDistinctLatestSessionTemplate = async function (group, categorie) {
    return await this.aggregate([
        { $sort: { "createdAt": -1 } },
        { $match: { group: new Types.ObjectId(group), sessionCategorie: categorie } },
        // to project the docs ( if i need all the data)
        // {
        //     $project: {
        //         docs: 1
        //     }
        // }
        {
            $group: {
                _id: { day: "$day", startsAt: "$startsAt" },
                doc: { $first: "$$ROOT" }
            },
        },
        {
            $replaceRoot: {
                newRoot: "$doc"
            }
        }
    ])
}

Session.index({ classroom: 1, day: 1, startsAt: 1} , {unique : true})

module.exports = model("Session", Session)

