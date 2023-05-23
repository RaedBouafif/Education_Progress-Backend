const jwt = require("jsonwebtoken")
require("dotenv").config()

const authMiddleWare = (roles) => {
    roles = roles ? roles : []
    return (req, res, next) => {
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
                if ((decoded?.role && roles.includes(decoded?.role)) || roles.length === 0) {
                    console.log("authorized")
                }
                else {
                    return res.status(401).json({ error: 'Unauthorized' });
                }
            }
            catch (e) {
                res.clearCookie('tck')
                return res.status(406).json(e)
            }
        }
        return next();
    }
}



module.exports = authMiddleWare