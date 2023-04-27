const Router = require("express").Router()
const {
    createMessage,
    getMessages,
    getMyAllLastMessages,
    getMyAllConversations
} = require("../controllers/message.controller")


Router.route("/create").post(createMessage)
Router.route("/getMessages/:user1/:user2").get(getMessages)
Router.route("/getMyAllLastMessages/:id").get(getMyAllLastMessages)
Router.route("/getMyAllConversations/:id").get(getMyAllConversations)
module.exports = Router