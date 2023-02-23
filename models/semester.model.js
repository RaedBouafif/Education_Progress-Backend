const { Schema, model } = require('mongoose')



const Semester = Schema(
    {
        name: {
            type: String,
            required: [true, "nameRequired"]
        },
        dateBegin: {
            type: Date,
            required: [true, "dateBeginRequired"],
            unique: true
        },
        dateEnd: {
            type: Date,
            required: [true, "dateEndRequired"]
        },
        coefficient: {
            type: Number,
            required: [true, "coefficientRequired"]
        },
        active: {
            type: Boolean,
            default: true
        },
        plannings : [{
            type : Schema.Types.ObjectId,
            ref : "Planning"
        }]

        // année universitaire
    },
    {
        timestamp: true
    }
)

module.exports = model("Semester", Semester)





