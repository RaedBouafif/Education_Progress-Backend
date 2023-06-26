const { model, Schema, Types } = require("mongoose")

const Examen = Schema({
    examTitle: {
        type: String
    },
    collegeYear: {
        type: Types.ObjectId,
        ref: "CollegeYear"
    },
    semester: {
        type: Types.ObjectId,
        ref: "Semester"
    },
    examType: {
        type: String,
        enum : ["Synthèse", "Controle", "Atelier", "Tp"]
    },
    beginDate: {
        type: Date,
        required : [true, "beginDateRequired"]
    },
    endingDate: {
        type: Date,
        required: [true, "endingDateRequired"]
    }
},
{
    timestamps: true
})

Examen.index({ semester: 1, collegeYear: 1, examTitle : 1 }, { unique: true })


module.exports = model("Examen", Examen)
