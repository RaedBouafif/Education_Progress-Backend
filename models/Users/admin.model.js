const mongoose = require("mongoose")

const Admin = new mongoose.Schema(
    {
        firstName: {
            type: String,
            trim: true,
            required: [true, "nameRequired"],
        },
        lastName: {
            type: String,
            trim: true,
            required: [true, "nameRequired"],
        },
        tel : {
            type: String,
            trim: true,
            required: [true, "telRequired"],
            validate: {
                validator: (value) => {
                    return /^\+?\d+$/.test(value.trim())
                },
                message: "invalidTel"
            },
            unique: true
        },
        email : {
            type: String,
            trim: true,
            required: [true, "emailRequired"],
            unique: true,
            validate: {
                validator: (value) => {
                    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value.trim())
                },
                message: "invalidEmail"
            },
            lowercase: true,
            unique: true
        },
        gender: {
            type: String,
            enum: ["Male", "Female"],
            required: [true, "genderRequired"]
        },
        adresse: {
            type: String,
        },
        birth : {
            type : Date,
            required: [true, "birthRequired"]
        },
        username: {
            type: String,
            requried: [true, "loginRequired"],
            unique: true
        },
        password: {
            type: String,
            requried: [true, "passwordRequired"],
        },
        role: {
            type: String,
            enum: ['super', 'admin', 'owner'],
            required: [true, "roleRequired"],
            default: 'admin'
        },
        image : {
            type : String
        },
        note : {
            String
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Admin", Admin)