const mongoose = require("mongoose")



const Parent = mongoose.Schema(
    {
        firstName: {
            type: String,
            trim: true,
            required: [true, "nameRequired"],
            minLength: [2, "shortName"],
        },
        lastName: {
            type: String,
            trim: true,
            required: [true, "lastNameRequired"],
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
            lowercase: true,
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
        gender: {
            type: String,
            enum: ["Male", "Female"],
            required: [true, "genderRequired"]
        },
        adresse: {
            type: String,
            required: [true, "adresseRequired"]
        },
        birth : {
            type : Date,
            required : [true, "birthRequired"]
        },
        students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
        image : {
            type : String
        },
        note : {
            String
        }
    }
    ,
    {
        timestamps: true
    }
)



module.exports = mongoose.model("Parent", Parent)