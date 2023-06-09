const jwt = require("jsonwebtoken")


const generateToken = (data, duration) => {
    const accessToken = jwt.sign(
        data,
        process.env.TOKEN_KEY,
        {
            expiresIn: duration
        }
    )
    return accessToken
}


module.exports = generateToken