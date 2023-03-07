const { Schema, model } = require('mongoose')


const SessionLogsSchema = Schema(
    {
        session: {
            type: Schema.Types.ObjectId,
            ref: "Session",
            required: [true, "SessionRequired"]
        },
        startedAt: {
            type: Date
        },
        endedAt: {
            type: Date
        },
        rates: [
            {
                studentId: {
                    type: Schema.Types.ObjectId , 
                    unique : true
                },
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
                studentId: {
                    type: Schema.Types.ObjectId,
                    unique : true
                },
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
        canceled: {
            type: Boolean,
            default: false
        },
        modifiedBy: {
            type: String
        }
    },
    {
        timestamp: true,
    }
)
SessionLogsSchema.virtual('createdAtDate').get(function() {
    return this.createdAt.toISOString().substr(0, 10)
})

SessionLogsSchema.index({ session : 1,  createdAtDate : 1 }  , {unique : true})
module.exports = model("SessionLogs", SessionLogsSchema)