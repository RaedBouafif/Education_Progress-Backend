const { Schema, model, Types } = require("mongoose")

const Session = Schema(
    {
        teacher: {
            type: Schema.Types.ObjectId,
            ref: "Teacher",
        },
        subTeacher: {
            type: Schema.Types.ObjectId,
            ref: "Teacher",
        }
        , classroom: {
            type: Schema.Types.ObjectId,
            ref: "Classroom",
        },
        subject: {
            type: Schema.Types.ObjectId,
            ref: "Subject",
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
            type: Number
        },
        endedAt: {
            type: Number
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
        sessionType: {
            type: String,
            required: [true, "sessionTypeRequired"],
            enum: ['TP', 'COUR', "EXAM", "EVENT"]
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
        delaid: {
            type: Boolean,
            default: false
        },
        duration: {
            type: Number,
            dafault: 1
        },
        initialSubGroup: {
            type: String,
            required: [true, "sessionTypeRequired"],
            enum: ['G1', 'G2', 'All']
        },
        sessionCategorie: {
            type: String,
            required: [true, "sessionCategorieRequired"],
            enum: ['Template', 'Planning']
        },
        catchedBy: {
            type: Schema.Types.ObjectId,
            ref: "Session",
        },
        catched: {
            type: Schema.Types.ObjectId,
            ref: "Session",
        },
        treated: {
            type: Boolean,
            default: false
        },
        examen: {
            type: Types.ObjectId,
            ref: "Examen"
        },
        event: {
            type: Types.ObjectId,
            ref: "Evennement"
        },
        invitedActor: {
            type: String
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

// Session.index({ classroom: 1, day: 1, startsAt: 1} , {unique : true})

module.exports = model("Session", Session)

