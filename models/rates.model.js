const { model , Schema, Types } = require("mongoose")

const Rates = Schema({
    student : {
        type : Schema.Types.ObjectId,
        ref : "Student"
    },
    avis : {
        type : String
    },
    type : {
        type : String
    },
    value: {
        type: Number,
        min: [0, "InvalidRate"],
        max: [5, "InvalidRate"]
    },
    teacher : {
        type : Schema.Types.ObjectId,
        ref : "teacher",
    },
    rater : {
        type : Schema.Types.ObjectId,
        ref : "Admin" // a changer parceque le rate peut etre réaliser par admin/etudiant/prof
    }
})

module.exports = model("Rates", Rates)


