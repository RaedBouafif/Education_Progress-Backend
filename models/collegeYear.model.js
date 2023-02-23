const mongoose = require("mongoose")


const CollegeYear = mongoose.Schema(
    {
        year : {
            type : String,
            required : [true , "yearRequired"]
        },
        semesters : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : "Semester"
            }
        ],
        active : {
            type : Boolean,
            default : true
        }
    }
)

module.exports = mongoose.model("CollegeYear", CollegeYear)