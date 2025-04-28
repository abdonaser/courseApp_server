module.exports = (asyncControllerFunction) => {
    return (req, res, next) => {
        asyncControllerFunction(req, res, next).catch((error) => {
            return next(error)
        })
    }
}