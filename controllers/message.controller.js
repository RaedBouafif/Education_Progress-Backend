
const { restart } = require("nodemon")
const MessageModel = require("../models/message.model")
const { Types } = require("mongoose")




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
        var messages = await MessageModel.updateMany({
            sender: user2, receiver: user1
        }, { seen: true })
        messages = await MessageModel.find({
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


exports.getMyAllLastMessages = async (req, res) => {
    try {
        const id = req.params.id
        var distinctReceiver = await MessageModel.aggregate([
            {
                $match: {
                    receiver: new Types.ObjectId(id)
                }
            },
            {
                $sort: {
                    "dateSend": -1
                }
            },
            {
                $lookup: {
                    from: "teachers", // Replace with the actual collection name for Teacher documents
                    localField: "sender",
                    foreignField: "_id",
                    as: "senderTeacher"
                }
            },
            {
                $lookup: {
                    from: "parents", // Replace with the actual collection name for Parent documents
                    localField: "sender",
                    foreignField: "_id",
                    as: "senderParent"
                }
            },
            {
                $lookup: {
                    from: "admins", // Replace with the actual collection name for Parent documents
                    localField: "sender",
                    foreignField: "_id",
                    as: "senderAdmin"
                }
            },
            {
                $addFields: {
                    senderData: {
                        $switch: {
                            branches: [
                                {
                                    case: { $eq: ["$senderPath", "Teacher"] },
                                    then: { $arrayElemAt: ["$senderTeacher", 0] }
                                },
                                {
                                    case: { $eq: ["$senderPath", "Parent"] },
                                    then: { $arrayElemAt: ["$senderParent", 0] }
                                },
                                {
                                    case: { $eq: ["$senderPath", "Admin"] },
                                    then: { $arrayElemAt: ["$senderAdmin", 0] }
                                }
                            ],
                            default: null
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$sender",
                    document: { $first: "$$ROOT" }
                }
            },
            {
                $sort: {
                    "document.dateSend": -1
                }
            }
        ])
        if (distinctReceiver?.length) {
            return res.status(200).json(distinctReceiver.map((element) => element.document).flatMap((element) => element))
        }
        else {
            return res.status(204).json([])
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            error: "serverSideError"
        })
    }
}




exports.getMyAllConversations = async (req, res) => {
    try {
        const id = req.params.id
        var distinctReceiver = await MessageModel.aggregate([
            {
                $match: {
                    $or: [
                        { receiver: new Types.ObjectId(id) },
                        { sender: new Types.ObjectId(id) }
                    ]
                }
            },
            {
                $sort: {
                    "dateSend": -1
                }
            },
            {
                $lookup: {
                    from: "teachers", // Replace with the actual collection name for Teacher documents
                    localField: "sender",
                    foreignField: "_id",
                    as: "senderTeacher"
                }
            },
            {
                $lookup: {
                    from: "parents", // Replace with the actual collection name for Parent documents
                    localField: "sender",
                    foreignField: "_id",
                    as: "senderParent"
                }
            },
            {
                $lookup: {
                    from: "admins", // Replace with the actual collection name for Parent documents
                    localField: "sender",
                    foreignField: "_id",
                    as: "senderAdmin"
                }
            },
            {
                $lookup: {
                    from: "teachers", // Replace with the actual collection name for Teacher documents
                    localField: "receiver",
                    foreignField: "_id",
                    as: "receiverTeacher"
                }
            },
            {
                $lookup: {
                    from: "parents", // Replace with the actual collection name for Parent documents
                    localField: "receiver",
                    foreignField: "_id",
                    as: "receiverParent"
                }
            },
            {
                $lookup: {
                    from: "admins", // Replace with the actual collection name for Parent documents
                    localField: "receiver",
                    foreignField: "_id",
                    as: "receiverAdmin"
                }
            },
            {
                $addFields: {
                    senderData: {
                        $switch: {
                            branches: [
                                {
                                    case: { $eq: ["$senderPath", "Teacher"] },
                                    then: { $arrayElemAt: ["$senderTeacher", 0] }
                                },
                                {
                                    case: { $eq: ["$senderPath", "Parent"] },
                                    then: { $arrayElemAt: ["$senderParent", 0] }
                                },
                                {
                                    case: { $eq: ["$senderPath", "Admin"] },
                                    then: { $arrayElemAt: ["$senderAdmin", 0] }
                                }
                            ],
                            default: null
                        }
                    },
                    receiverData: {
                        $switch: {
                            branches: [
                                {
                                    case: { $eq: ["$receiverPath", "Teacher"] },
                                    then: { $arrayElemAt: ["$receiverTeacher", 0] }
                                },
                                {
                                    case: { $eq: ["$receiverPath", "Parent"] },
                                    then: { $arrayElemAt: ["$receiverParent", 0] }
                                },
                                {
                                    case: { $eq: ["$receiverPath", "Admin"] },
                                    then: { $arrayElemAt: ["$receiverAdmin", 0] }
                                }
                            ],
                            default: null
                        }
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ['$receiver', new Types.ObjectId(id)] },
                            '$sender',
                            '$receiver'
                        ]
                    },
                    message: {
                        $first: '$$ROOT'
                    }
                }
            },
            {
                $sort: {
                    "document.dateSend": -1
                }
            }
        ])
        console.log(distinctReceiver)
        if (distinctReceiver?.length) {
            return res.status(200).json(distinctReceiver.map((element) => element.message))
        }
        else {
            return res.status(204).json([])
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            error: "serverSideError"
        })
    }
}