const mongoose = require("mongoose")


const Classroom = mongoose.Schema(
    {
        classroomName: {
            type: String,
            required: [true, "classroomNameRequired"],
            unique: true,
            trim: true
        },
        type: {
            type: String,
            enum: ["TP", "COUR"],
            default: "COUR"
        }
    },
    {
        timestamps: true
    }
)


module.exports = mongoose.model("Classroom", Classroom)