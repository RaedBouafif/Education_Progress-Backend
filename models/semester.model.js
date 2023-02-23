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
        //weeks=>[] or something like this
    },
    {
        timestamp: true
    }
)

module.exports = model("Semester", Semester)





