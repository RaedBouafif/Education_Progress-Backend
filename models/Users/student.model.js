const mongoose = require("mongoose")


const Student = mongoose.Schema(
    {
        firstName: {
            type: String,
            trim: true,
            required: [true, "nameRequired"],
            validate: {
                validator: (value) => {
                    return /^[A-Za-z]+$/.test(value.trim())
                }
            },
            message: "invalidLastName",
            minLength: [2, "shortName"]
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
        username: {
            type: String,
            trim: true,
            required: [true, "usernameRequired"],
            unique: true,
            minLength: [2, "shortUsername"]
        },
        password: {
            type: String,
            trim: true,
            required: [true, "passwordRequired"],
            minLength: [6, "shortPassword"]
        },
        birth: {
            type: Date,
            required: [true, "birthRequired"]
        }
    },
    {
        timestamps: true
    }
)


module.exports = mongoose.model("Student", Student)