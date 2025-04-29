const jwt = require('jsonwebtoken')
const { ERROR, FAIL } = require('../utils/json_status_text')
const appError = require('../utils/appError')
const tokenErrorMassages = require('@utils/tokenErrorMessage')
const usersModel = require('../models/users.model')

const verifyJWT = async (req, res, next) => {

    const authHeader = req.headers.authorization || req.headers.Authorization

    if (!authHeader?.startsWith('Bearer ')) {
        const error = appError.create("Authorization header is missing or improperly formatted. Access denied.", 401, ERROR)
        return next(error)
    }

    const token = authHeader.split(" ")[1];

    const decodedData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {

        if (err) {
            const errorMessage = (err.name == "TokenExpiredError") ? tokenErrorMassages.expired : tokenErrorMassages.public;
            const error = appError.create(errorMessage, 403, ERROR)
            return next(error)
        }
        if (!decoded?.userInfo) {
            const error = appError.create("Token payload is malformed.", 403, ERROR);
            return next(error);
        }
        return decoded
    })

    const user = await usersModel.findById(decodedData?.userInfo.id);
    if (!user) {
        return next(appError.create('User no longer exists!', 401, FAIL));
    }

    if (user.changedPasswordAfter(decodedData.iat)) {
        return next(appError.create('Password changed recently. Please log in again.', 401, FAIL));
    }

    req.user = {
        id: decodedData.userInfo.id,
        role: decodedData.userInfo.role,
    };
    // Proceed to the next middleware or route handler
    return next();
}



module.exports = verifyJWT