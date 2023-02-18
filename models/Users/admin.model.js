const mongoose = require("mongoose")

const Admin = new mongoose.Schema(
    {
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
            enum: ['super-admin', 'admin', 'owner'],
            required: [true, "roleRequired"],
            default: 'admin'
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Admin", Admin)