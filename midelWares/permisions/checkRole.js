const appError = require("../../utils/appError");
const { ERROR } = require("../../utils/json_status_text");

const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole) {
            const error = appError.create("the USer Role is Not Defined", 404, ERROR)
            return next(error)
        }

        if (!allowedRoles.includes(userRole)) {
            const error = appError.create('Access denied: You do not have permission to perform this action', 403, ERROR)
            return next(error)
        }
        next();
    }
};



module.exports = checkRole