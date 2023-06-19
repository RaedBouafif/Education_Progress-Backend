const mongoose = require("mongoose")
const { Types } = require("mongoose")


const DeclarationAbsence = mongoose.Schema(
    {
       absenceCategory: {
        type: String,
        enum: [ "Teacher", "Student"]
       },
       student: {
        type: Types.ObjectId,
        ref : "Student"
       },
       teacher: {
        type: Types.ObjectId,
        ref: "Teacher"
       },
       dateDeb: {
        type: Date,
        required: [true, "dateDebRequired"]
       },
       dateFin: {
        type: Date,
        required: [true, "dateDebRequired"]
       },
       description: {
        type: String
       },
       file: {
            name: {
                type: String,
            },
            path: {
                type: String
            }
       },
       active: {
            type: Boolean
       }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("DeclarationAbsence", DeclarationAbsence)