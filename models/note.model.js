const { model, Schema, Types } = require("mongoose")

const Note = Schema({
    student: {
        type: Types.ObjectId,
        ref: "Student",
        required: [true, "studentRequired"],
    },
    note: {
        required: [true, "noteRequired"],
        type: Number
    },
    examen: {
        type: Types.ObjectId,
        ref: "Examen",
        required: [true, "examenRequired"],
    },
},
    {
        timestamps: true
    }
)


Note.index({ student: 1, examen: 1 }, { unique: true })

module.exports = model("Note", Note)