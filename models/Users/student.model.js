const mongoose = require("mongoose")


const Student = mongoose.Schema(
    {
        firstName: {
            type: String,
            trim: true,
            required: [true, "nameRequired"],
            minLength: [2, "shortName"]
        },
        lastName: {
            type: String,
            trim: true,
            required: [true, "lastNameRequired"],
            minLength: [2, "shortLastName"],
        },
        username: {
            type: String,
            trim: true,
            required: [true, "usernameRequired"],
            unique: true,
            minLength: [2, "shortUsername"]
        },
        password: {
            type: String,
            required: [true, "passwordRequired"],
        },
        birth: {
            type: Date,
            required: [true, "birthRequired"]
        },
        gender: {
            type: String,
            enum: ["Male", "Female"],
            required: [true, "genderRequired"]
        },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Parent'
        },
        adresse: {
            type: String
        },
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group"
        },
        image: {
            type: String
        },
        tel: {
            type: String,
            trim: true,
        },
        note: {
            type: String
        },
    },
    {
        timestamps: true
    }
)


module.exports = mongoose.model("Student", Student)
