const { model, Schema } = require("mongoose")



const Section = Schema(
    {
        sectionName: {
            type: String,
            required: [true, "sectionNameRequired"],
            unique: true,
        },
        subjects: [{ type: Schema.Types.ObjectId, ref: "Subject" }],
        active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)


module.exports = model("Section", Section)