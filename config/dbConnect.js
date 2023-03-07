var mongoose = require("mongoose")
const express = require("express")
require("dotenv").config();


const connectDB = () => {
    return mongoose.connect(process.env.MONGO_URI , {
        // useNewUrlParser : true,
        // useUnifiedTopology : true,
        // useCreateIndex : true,
    })
}

module.exports = connectDB