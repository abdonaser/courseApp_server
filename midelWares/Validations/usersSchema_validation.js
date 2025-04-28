const { body } = require('express-validator');
const { Admin, Manager, User } = require('../../utils/permissions')
const MIN_LENGTH = 2;
const pass_MIN_LENGTH = 3

const ALLOWED_ROLES = [Admin, Manager, User];

//Error Messages---------
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
    currentPassword: {
        empty: "Password can't be empty",
        length: `Password must be at least ${pass_MIN_LENGTH} characters long`,
    },
    newPassword: {
        empty: "newPassword can't be empty",
        length: `newPassword must be at least ${pass_MIN_LENGTH} characters long`,
    },
    newPasswordConfirm: {
        empty: "newPasswordConfirm can't be empty",
        length: `newPasswordConfirm must be at least ${pass_MIN_LENGTH} characters long`,
    },
};
//Validators---------
const firstNameValidator = body('firstName')
    .trim()
    .escape()
    .notEmpty().withMessage(validationMessages.firstName.empty)
    .isLength({ min: MIN_LENGTH }).withMessage(validationMessages.firstName.length);
const lastNameValidator = body('lastName')
    .trim()
    .escape()
    .notEmpty().withMessage(validationMessages.lastName.empty)
    .isLength({ min: MIN_LENGTH }).withMessage(validationMessages.lastName.length);
const emailValidator = body('email')
    .trim()
    .normalizeEmail()
    .notEmpty().withMessage(validationMessages.email.empty)
    .isEmail().withMessage(validationMessages.email.invalid);
const passwordValidator = body('password')
    .trim()
    .notEmpty().withMessage(validationMessages.password.empty)
    .isLength({ min: pass_MIN_LENGTH }).withMessage(validationMessages.password.length);
const passwordConfirmValidator = body('passwordConfirm')
    .trim()
    .notEmpty().withMessage(validationMessages.passwordConfirm.empty);
const roleValidator = body('role')
    .trim()
    .notEmpty().withMessage(validationMessages.role.empty)
    .toLowerCase()
    .isIn(ALLOWED_ROLES).withMessage(validationMessages.role.invalid);
const resetCodeValidator = body('resetCode')
    .trim()
    .notEmpty().withMessage(validationMessages.resetCode.empty)
    .isString().withMessage(validationMessages.resetCode.invalid);
const verifyCodeValidator = body('verifyCode')
    .trim()
    .notEmpty().withMessage(validationMessages.verifyCode.empty)
    .isString().withMessage(validationMessages.verifyCode.invalid);
const currentPasswordValidator = body('currentPassword')
    .trim()
    .notEmpty().withMessage(validationMessages.currentPassword.empty)
    .isLength({ min: pass_MIN_LENGTH }).withMessage(validationMessages.currentPassword.length);
const newPasswordValidator = body('newPassword')
    .trim()
    .notEmpty().withMessage(validationMessages.newPassword.empty)
    .isLength({ min: pass_MIN_LENGTH }).withMessage(validationMessages.newPassword.length);
const newPasswordConfirmValidator = body('newPasswordConfirm')
    .trim()
    .notEmpty().withMessage(validationMessages.newPasswordConfirm.empty)
    .isLength({ min: pass_MIN_LENGTH }).withMessage(validationMessages.newPasswordConfirm.length);


// --------------------------------------------------------------
const rgisterValidation = () => {
    return [
        firstNameValidator,
        lastNameValidator,
        emailValidator,
        passwordValidator,
        passwordConfirmValidator,
        roleValidator
    ];
};
const loginValidation = () => {
    return [
        emailValidator,
        passwordValidator,
    ];
}
const forgotPasswordValidation = () => {
    return [
        emailValidator,
    ]
}
const resetPasswordValidation = () => {
    return [
        passwordValidator,
        passwordConfirmValidator,
        resetCodeValidator
    ];
}
const verifyAccountValidation = () => {
    return [
        emailValidator,
        verifyCodeValidator
    ];
}
const resendVerificationCodeValidation = () => {
    return [
        emailValidator,
    ]
}
const updateMyPasswordValidation = () => {
    return [
        currentPasswordValidator,
        newPasswordValidator,
        newPasswordConfirmValidator
    ]
}
module.exports = {
    rgisterValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    verifyAccountValidation,
    resendVerificationCodeValidation,
    updateMyPasswordValidation
};

