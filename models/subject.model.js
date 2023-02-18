const mongoose = require("mongoose")



const Subject = mongoose.Schema(
    {
        subjectName: {
            type: String,
            required: [true, "subjectNameRequired"],
            unique: true
        },
        properties: [{
            section : {type :String, required : true},
            coefficient : {type : Number, required : true},
            required : true
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




module.exports = mongoose.model("Subject", Subject)