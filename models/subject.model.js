const mongoose = require("mongoose")


//Sub-schema
const PropertiesSchema = mongoose.Schema(
    {
        sectionName : {
            type : String,
            required : [true, "sectionNameRequired!!"],
        },
        coefficient : {
            type : Number,
            required : [true, "coefficientRequired!!"]
        },
        active : {
            type : Boolean,
            default : true
        }
    }
)

//Main-Schema
const SubjectSchema = mongoose.Schema(
    {
        subjectName: {
            type: String,
            required: [true, "subjectNameRequired"],
            unique: true,
            trim: true
        },
        properties : [{type : PropertiesSchema , requried : true}],
        active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)

module.exports = {
   Subject : mongoose.model("Subject", SubjectSchema),
   Properties : mongoose.model("Properties",PropertiesSchema)
}
