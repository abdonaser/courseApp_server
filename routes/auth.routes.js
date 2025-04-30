const { register, login,
    logout, refresh,
    forgotPassword, resetPassword,
    verifyAccount, resendVerificationCode
} = require('../controlers/authControlers')
const { loginValidation, rgisterValidation,
    forgotPasswordValidation, resetPasswordValidation,
    verifyAccountValidation, resendVerificationCodeValidation
} = require('../midelWares/Validations/usersSchema_validation')
const upload = require('../helpers/uploadImages.js')
const router = require('express').Router()





router.route('/register')
    .post(upload.single('avatar'), rgisterValidation(), register)

router.route('/verifyaccount')
    .post(verifyAccountValidation(), verifyAccount)

router.route('/resendverificationcode')
    .post(resendVerificationCodeValidation(), resendVerificationCode)

router.route('/login')
    .post(loginValidation(), login)

router.route('/logout')
    .post(logout)

router.route('/refresh')
    .get(refresh)

router.route('/forgotPassword')
    .post(forgotPasswordValidation(), forgotPassword)

router.route('/resetPassword')
    .patch(resetPasswordValidation(), resetPassword)
module.exports = router