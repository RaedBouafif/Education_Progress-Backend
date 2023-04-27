const jwt = require("jsonwebtoken")
require("dotenv").config()

const authMiddleWare = (req, res, next) => {
    const token = req.cookies?.tck
    if (!token) {
        res.clearCookie('tck')
        return res.status(403).json({
            "name": "NoTokenProvided"
        })
    } else {
        try {
            const decoded = jwt.verify(token, process.env.TOKEN_KEY)
            req.body.decodedToken = decoded;
        }
        catch (e) {
            res.clearCookie('tck')
            return res.status(406).json(e)
        }
    }
    return next();
}

module.exports = authMiddleWare