const { Schema, model } = require("mongoose")

const teacherAbsence = Schema(
    {
        teacher: {
            type: Schema.Types.ObjectId,
            ref: "Teacher",
            required: [true, "teacherRequired"]
        },
        session: {
            type: Schema.Types.ObjectId,
            ref: "Session",
            required: [true, "sessionRequired"]
        },
        justified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

teacherAbsence.virtual('createdAtDate').get(function() {
    return this.createdAt.toISOString().substr(0, 10)
})
 
teacherAbsence.index({ teacher : 1 , session : 1,  createdAtDate : 1 }  , {unique : true})


module.exports = model("TeacherAbsence", teacherAbsence)