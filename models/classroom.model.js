const mongoose = require("mongoose")


const Classroom = mongoose.Schema(
    {
        classroomName: {
            type: String,
            required: [true, "classroomNameRequired"],
            unique: true,
            trim: true,
            lowercase: true
        },
        type: {
            type: String,
            enum: ["TP", "COUR"],
            default: "COUR"
        },
        nbrPlace: {
            type: Number,
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


module.exports = mongoose.model("Classroom", Classroom)