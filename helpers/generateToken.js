const jwt = require('jsonwebtoken');


const tokenInfo = (data) => {
    return {
        userInfo: {
            id: data._id,
            role: data.role,
        }
    }
}

const accessTokenGenerated = (userData) => {
    const userTokenInfo = tokenInfo(userData)
    return jwt.sign(userTokenInfo, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
}


const refreshTokenGenerated = (userData) => {
    const userTokenInfo = tokenInfo(userData)
    return jwt.sign(userTokenInfo, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
}


module.exports = { accessTokenGenerated, refreshTokenGenerated }

