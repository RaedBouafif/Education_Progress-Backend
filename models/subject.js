const mongoose = require("mongoose")



const Subject = mongoose.Schema(
    {
        subjectName: {
            type: String,
            required: [true, "subjectNameRequired"],
            unique: true
        },
        coefficient: {
            type: Number,
            required: [true, "coefficientRequired"]
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





module.exports = mongoose.model("Subject", Subject)