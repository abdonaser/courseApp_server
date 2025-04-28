const { body } = require('express-validator');
const { Admin, Manager, User } = require('../../utils/permissions')
const MIN_LENGTH = 2;
const pass_MIN_LENGTH = 3

const ALLOWED_ROLES = [Admin, Manager, User];

const validationMessages = {
    firstName: {
        empty: "First name can't be empty",
        length: `First name must be at least ${MIN_LENGTH} characters long`,
    },
    lastName: {
        empty: "Last name can't be empty",
        length: `Last name must be at least ${MIN_LENGTH} characters long`,
    },
    email: {
        empty: "Email can't be empty",
        invalid: "Email must be valid",
    },
    password: {
        empty: "Password can't be empty",
        length: `Password must be at least ${pass_MIN_LENGTH} characters long`,
    },
    passwordConfirm: {
        empty: "passwordConfirm can't be empty",
    },
    role: {
        empty: "Role can't be empty",
        invalid: `Role must be one of: ${ALLOWED_ROLES.join(', ')}`,
    },
    resetCode: {
        empty: 'Reset code cannot be empty.',
        invalid: 'Reset code must be a String.',
    },
    verifyCode: {
        empty: 'Reset code cannot be empty.',
        invalid: 'Reset code must be a String.',
    },
};

const rgisterValidation = () => {
    return [
        // firstName validation
        body('firstName')
            .trim()
            .escape()
            .notEmpty().withMessage(validationMessages.firstName.empty)
            .isLength({ min: MIN_LENGTH }).withMessage(validationMessages.firstName.length),

        // lastName validation
        body('lastName')
            .trim()
            .escape()
            .notEmpty().withMessage(validationMessages.lastName.empty)
            .isLength({ min: MIN_LENGTH }).withMessage(validationMessages.lastName.length),

        // email validation
        body('email')
            .trim()
            .normalizeEmail()
            .notEmpty().withMessage(validationMessages.email.empty)
            .isEmail().withMessage(validationMessages.email.invalid),

        // password validation
        body('password')
            .trim()
            .notEmpty().withMessage(validationMessages.password.empty)
            .isLength({ min: pass_MIN_LENGTH }).withMessage(validationMessages.password.length),
        body('passwordConfirm')
            .trim()
            .notEmpty().withMessage(validationMessages.passwordConfirm.empty),
        body('role')
            .trim()
            .notEmpty().withMessage(validationMessages.role.empty)
            .toLowerCase()
            .isIn(ALLOWED_ROLES).withMessage(validationMessages.role.invalid),
    ];

};

const loginValidation = () => {
    return [
        // email validation
        body('email')
            .trim()
            .normalizeEmail()
            .notEmpty().withMessage(validationMessages.email.empty)
            .isEmail().withMessage(validationMessages.email.invalid),

        // password validation
        body('password')
            .trim()
            .notEmpty().withMessage(validationMessages.password.empty)
            .isLength({ min: pass_MIN_LENGTH }).withMessage(validationMessages.password.length),
    ];
}

const forgotPasswordValidation = () => {
    return [
        // email validation
        body('email')
            .trim()
            .normalizeEmail()
            .notEmpty().withMessage(validationMessages.email.empty)
            .isEmail().withMessage(validationMessages.email.invalid),
    ]
}


const resetPasswordValidation = () => {
    return [
        body('password')
            .trim()
            .notEmpty().withMessage(validationMessages.password.empty)
            .isLength({ min: pass_MIN_LENGTH }).withMessage(validationMessages.password.length),
        body('passwordConfirm')
            .trim()
            .notEmpty().withMessage(validationMessages.passwordConfirm.empty),
        body('resetCode')
            .trim()
            .notEmpty().withMessage(validationMessages.resetCode.empty)
            .isString().withMessage(validationMessages.resetCode.invalid)
    ];
}
const verifyAccountValidation = () => {
    return [
        body('email')
            .trim()
            .normalizeEmail()
            .notEmpty().withMessage(validationMessages.email.empty)
            .isEmail().withMessage(validationMessages.email.invalid),
        body('verifyCode')
            .trim()
            .notEmpty().withMessage(validationMessages.verifyCode.empty)
            .isString().withMessage(validationMessages.verifyCode.invalid)
    ];

}

const resendVerificationCodeValidation = () => {
    return [
        body('email')
            .trim()
            .normalizeEmail()
            .notEmpty().withMessage(validationMessages.email.empty)
            .isEmail().withMessage(validationMessages.email.invalid),
    ]
}

module.exports = {
    rgisterValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    verifyAccountValidation,
    resendVerificationCodeValidation
};

