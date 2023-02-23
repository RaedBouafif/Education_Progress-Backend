const mongoose = require("mongoose")




const Teacher = mongoose.Schema(
    {
        firstName: {
            type: String,
            trim: true,
            required: [true, "nameRequired"],
            validate: {
                validator: (value) => {
                    return /^[A-Za-z]+$/.test(value.trim())
                },
                message: "invalidLastName",
            },
            minLength: [2, "shortName"],
        },
        lastName: {
            type: String,
            trim: true,
            required: [true, "lastNameRequired"],
            validate: {
                validator: (value) => {
                    return /^[A-Za-z]+$/.test(value.trim())
                },
                message: "invalidLastName"
            },
            minLength: [2, "shortLastName"],
        },
        password: {
            type: String,
            required: [true, "passwordRequired"],
        },
        email: {
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
        tel: {
            type: String,
            trim: true,
            required: [true, "telRequired"],
            validate: {
                validator: (value) => {
                    return /^\+?\d+$/.test(value.trim())
                },
                message: "invalidTel"
            }
        },
        gender: {
            type: String,
            enum: {
                values: ["femme", "homme"],
                message: "invalidGenderEnum"
            },
            required: [true, "genderRequired"]
        },
        maritalStatus: {
            type: String,
            enum: {
                values: ["celibataire", "marie"],
                message: "invalidMaritalStatusEnum"
            },
            required: [true, "maritalStatusRequired"]
        },
        subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
    },
    {
        timestamps: true
    }
)



module.exports = mongoose.model("Teacher", Teacher)