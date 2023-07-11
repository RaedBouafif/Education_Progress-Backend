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
    examNumber: {
        type: Number,
        enum: [1,2,3,4,5]
    },
    beginDate: {
        type: Date,
        required : [true, "beginDateRequired"]
    },
    endingDate: {
        type: Date,
        required: [true, "endingDateRequired"]
    },
    groups: [{
        type: Types.ObjectId,
        ref: "Group"
    }],
    subject: {
        type: Types.ObjectId,
        ref: "Subject"
    },
    responsibleNotes: {
        type: Types.ObjectId,
        ref: "Teacher"
    }
},
{
    timestamps: true
})

    Examen.index({ semester: 1, collegeYear: 1, examTitle : 1, beginDate: 1 }, { unique: true })


module.exports = model("Examen", Examen)
