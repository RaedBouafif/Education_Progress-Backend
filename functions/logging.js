const Logs = require("../models/logs")
const jwt = require("jsonwebtoken")

const logData = async (modelId, modelType, action) => {
    const decodedToken = await jwt.verify(req.cookies.tck, process.env.TOKEN_KEY)
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
            action : action || null
        })
        await log.save()
    }else return false
}

module.exports = logData