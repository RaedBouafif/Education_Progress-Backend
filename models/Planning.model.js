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
        exams: [{
            type: Schema.Types.ObjectId,
            ref: "Examen"
        }],
        weekType: {
            type: String,
            enum: ["Examen", "Vacation", "Default"],
            default : "Default"
        },
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


