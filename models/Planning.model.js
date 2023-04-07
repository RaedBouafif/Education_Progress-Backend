const { model, Schema } = require("mongoose")



const Planning = Schema(
    {
        week: {
            type: Number,
            required: [true, "weekRequired"],
            min: [0, "invalidWeek"] // max week needed 
            //autoincrement if group and year exist
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
        collegeYear: {
            type: Schema.Types.ObjectId,
            ref: "CollegeYear",
            required: [true, "collegeYearRequired"]
        },
        sessions: [{
            type: Schema.Types.ObjectId,
            ref: "Session",
        }],
        active: {
            type: Boolean,  
            default: true
        }
    },
    {
        timestamps: true 
    }
)


Planning.index({ week: 1, group: 1, collegeYear : 1 }, { unique: true })


module.exports = model("Planning", Planning)


