const { Schema, model } = require('mongoose')


const SessionLogsSchema = Schema(
    {
        sessionId : {
            type : Schema.Types.ObjectId,
            ref : "Session",
            required : [true, "SessionRequired"]
        },
        startedAt : {
            type : Date
        },
        endedAt : {
            type : Date
        },
        Rates : [
            {
                idStudent : {
                    type : Schema.Types.ObjectId
                },
                studentName : {
                    type : String
                },
                value : {
                    type : Number,
                    min : [0, "InvalidRate"],
                    max : [5, "InvalidRate"]
                }
            }
        ],
        Reports : [
            {
                idStudent : {
                    type : String
                },
                studentName : {
                    type : String
                },
                justifiedReports : {
                    type : Boolean,
                    default : false
                }
            }
        ],
        canceled : {
            type : Boolean,
            default : false
        },
        modifiedBy : {
            type : String
        }
    }, {
        timestamp : true,
    }
)

module.exports = model("SessionLogs",SessionLogsSchema)