const Router = require("express").Router()
const {
    createMessage,
    getMessages
} = require("../controllers/message.controller")


Router.route("/create").post(createMessage)
Router.route("/getMessages/:user1/:user2").get(getMessages)
module.exports = Router