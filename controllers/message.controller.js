
const { restart } = require("nodemon")
const MessageModel = require("../models/message.model")





exports.createMessage = async (req, res) => {
    try {
        if (!req.body.message || !req.body.sender || !req.body.senderPath || !req.body.receiver || !req.body.receiverPath || !req.body.dateSend)
            return res.status(400).json({
                error: "badRequest"
            })
        const message = await MessageModel.create(req.body)
        if (message) return res.status(201).json(message)
        else return res.status(400).json({
            error: "something happen when we save you message"
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            error: "serverSideError"
        })
    }
}


exports.getMessages = async (req, res) => {
    try {
        const { user1, user2 } = req.params
        const messages = await MessageModel.find({
            $or: [
                { sender: user1, receiver: user2 },
                { sender: user2, receiver: user1 },
            ]
        }).sort({ dateSend: 1 })
        if (messages.length) {
            return res.status(200).json(messages)
        } else {
            return res.status(204).json([])
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            error: "serverSideError"
        })
    }
}