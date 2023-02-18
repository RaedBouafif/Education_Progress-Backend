const mongoose = require("mongoose")



const Parent = mongoose.Schema(
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
            unique: true
        },
        password: {
            type: String,
            required: [true, "passwordRequired"]
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
            },
            unique: true
        },
        students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    }
    ,
    {
        timestamps: true
    }
)



module.exports = mongoose.model("Parent", Parent)