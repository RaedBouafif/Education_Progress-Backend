const { model, Schema } = require("mongoose")




const studentPayment = Schema(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: [true, "studentRequired"],
        },
        year: {
            type: Date,
            default: Date.now
        },
        semester: {
            type: String,
            required: [true, "semesterRequired"],
        },
        amount: {
            type: Number,
            required: [true, "amountrequired"]
        }
    },
    {
        timestamps: true
    }
)

module.exports = model("StudentPayment", studentPayment)