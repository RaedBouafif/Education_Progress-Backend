const { Schema, Types } = require("mongoose")
const mongoose = require("mongoose")

const Evennement =  Schema({
    eventName: {
        type: String
    },
    collegeYear: {
        type: Types.ObjectId,
        ref: "CollegeYear"
    },
    semester: {
        type: Types.ObjectId,
        ref: "Semester"
    },
    beginDate: {
        type: Date,
        required : [true, "beginDateRequired"]
    },
    endingDate: {
        type: Date,
        required: [true, "endingDateRequired"]
    },
    teachersParticipant: {
        type: Boolean
    },
    studentsParticipant: {
        type: Boolean
    },
    adminsParticipant: {
        type: Boolean
    }
},{
    timestamps: true
})

module.exports = mongoose.model("Evennement", Evennement)
