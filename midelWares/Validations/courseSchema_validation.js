const { body } = require('express-validator');

// Centralized error messages
const validationMessages = {
    title: {
        empty: "Title can't be empty",
        length: 'Title must be at least 2 characters long',
    },
    price: {
        empty: "Price can't be empty",
        invalid: 'Price must be a valid positive number',
    },
};

const fieldValidation = () => {
    return [
        // Title validation
        body('title')
            .trim() // Sanitize: remove leading/trailing spaces
            .notEmpty()
            .withMessage(validationMessages.title.empty)
            .isLength({ min: 2 })
            .withMessage(validationMessages.title.length),
        // Price validation
        body('price')
            .notEmpty()
            .withMessage(validationMessages.price.empty)
            .isFloat({ min: 0 }) // Ensure price is a positive number
            .withMessage(validationMessages.price.invalid)
            .toFloat(), // Sanitize: convert to float
    ];
}

module.exports = fieldValidation;