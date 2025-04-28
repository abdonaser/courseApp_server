class AppError extends Error {
    constructor() {
        super()
    }

    create(errorMessage, statusCode, statusText) {
        this.errorMessage = errorMessage
        this.statusCode = statusCode
        this.statusText = statusText
        return this
    }
}


module.exports = new AppError();