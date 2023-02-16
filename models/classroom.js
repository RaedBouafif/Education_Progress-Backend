const mongoose = require("mongoose")


const Classroom = mongoose.Schema(
    {
        className: {
            type: String,
            required: [true, "classNameRequired"],
            unique: true
        },
        type: {
            type: String,
            enum: ["TP", "COURS"],
            default: "COUR"
        }
    },
    {
        timestamps: true
    }
)


module.exports = mongoose.model("Classroom", Classroom)