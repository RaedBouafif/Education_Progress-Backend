const { model, Schema, Types } = require("mongoose")

const Message = Schema({
    message: {
        type: String
    },
    dateSend: {
        type: Date,
        required: [true, "dateSendRequired"]
    },
    sender: {
        type: Types.ObjectId,
        required: [true, "senderRequired"]
    },
    senderPath: {
        type: String,
        enum: ["Teacher", "Parent", "Admin"]
    },
    receiver: {
        type: Types.ObjectId,
        required: [true, "receiverRequired"]
    },
    receiverPath: {
        type: String,
        enum: ["Teacher", "Parent", "Admin"]
    },
    seen: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true
    }
)

module.exports = model("Message", Message)
