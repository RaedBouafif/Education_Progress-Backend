const { Schema, Types } = require("mongoose")
const mongoose = require("mongoose")

const Evennement =  Schema({
    eventName: {
        type: String
    },
    eventType: {
        type: String,
        enum : ["Réunion", "Workshop", "Club"]
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
    parentsParticipant: {
        type: Boolean
    },
    adminsParticipant: {
        type: Boolean
    },
    file: {
        name: {
            type: String,
        },
        path: {
            type: String
        }
    }
},{
    timestamps: true
})

module.exports = mongoose.model("Evennement", Evennement)
