const Logs = require("../models/logs")
const jwt = require("jsonwebtoken")

const logData = async ({modelId, modelType, secondModelId, secondModelType, action}) => {
    const decodedToken = await jwt.verify(req?.cookies?.tck, process.env.TOKEN_KEY)
    if (decodedToken){
        const roles = ["owner", "super", "admin"]
        const log = await Logs.create({
            user : {
                userId: decodedToken._id || null,
                userPath: (roles.includes(decodedToken.role) ? "Admin" : "Teacher") || null
            },
            model: {
                modelId: modelId || null,
                modelPath: modelType || null
            },
            action : `User with id: ${decodedToken._id}, ${action}` || null,
            secondModel: {
                modelId: secondModelId || null,
                modelPath: secondModelType || null
            }
        })
        await log.save()
    }else {
        res.clearCookie('tck')
        return res.status(403).json({
            "name": "NoTokenProvided"
        })
    }
}

module.exports = logData