const Router = require("express").Router()
const {
    createMessage,
    getMessages,
    getMyAllLastMessages
} = require("../controllers/message.controller")


Router.route("/create").post(createMessage)
Router.route("/getMessages/:user1/:user2").get(getMessages)
Router.route("/getMyAllLastMessages/:id").get(getMyAllLastMessages)
module.exports = Router