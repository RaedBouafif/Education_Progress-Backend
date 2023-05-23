const Router = require("express").Router()
const {
    createMessage,
    getMessages,
    getMyAllLastMessages,
    getMyAllConversations
} = require("../controllers/message.controller")
const authMiddleWare = require("../middlewares/auth")

Router.route("/create").post(authMiddleWare(), createMessage)
Router.route("/getMessages/:user1/:user2").get(authMiddleWare(), getMessages)
Router.route("/getMyAllLastMessages/:id").get(authMiddleWare(), getMyAllLastMessages)
Router.route("/getMyAllConversations/:id").get(authMiddleWare(), getMyAllConversations)
module.exports = Router