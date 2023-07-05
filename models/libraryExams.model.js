const { model, Schema, Types} = require("mongoose")

const LibraryExams = Schema({
    title: {
        type :String,
        required: [true, "examTitleRequired"]
    },
    examCategory: {
        type: String,
        enum: ["Examen", "Correction"],
        required: [true, "typeRequired"]
    },
    examType: {
        type: String,
        enum : ["Synthèse", "Controle", "Atelier", "Tp"]
    },
    examNumber: {
        type: Number,
        enum: [1,2,3,4,5]
    },
    subject: {
        type: Types.ObjectId,
        ref: "Subject"
    },
    collegeYear: {
        type: Types.ObjectId,
        ref: "CollegeYear"
    },
    semester: {
        type: Types.ObjectId,
        ref: "Semester"
    },
    groups: [{
        type: Types.ObjectId,
        ref: "Group"
    }],
    file: {
        name: {
            type: String,
        },
        path: {
            type: String
        }
    }
},
{timestamps: true})


module.exports = model("LibraryExams", LibraryExams)