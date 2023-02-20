const e = require("express")
const { model, Schema } = require("mongoose")



const Planning = Schema(
    {
        week: {
            type: Number,
            required: [true, "weekRequired"],
            min: [0, "invalidWeek"] // max week needed 
        },
        dateBegin: {
            type: Date,
            required: [true, "dateBeginRequired"]
        },
        dateEnd: {
            type: Date,
            required: [true, "dateEndRequired"]
        },
        group: {
            type: Schema.Types.ObjectId,
            ref: "Group",
            required: [true, "groupRequired"]
        },
        sessions: [{
            type: Schema.Types.ObjectId,
            ref: "Session",
        }]
    },
    {
        timestamps: true
    }
)


Planning.index({ week: 1, group: 1 }, { unique: true })

module.exports = model("Planning", Planning)