
const { Schema, model } = require("mongoose")


const Group = Schema(
    {
        groupName: {
            type: String,
            required: [true, "groupNameRequired"],
            unique: true , 
            trim : true
        },
        section: {
            type: Schema.Types.ObjectId,
            ref: "Section",
            required: true
        }
    },
    {
        timestamps: true
    }
)


module.exports = model("Group", Group)