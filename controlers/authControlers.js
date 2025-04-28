// import ;
const { validationResult } = require("express-validator");
const { SUCCESS, ERROR, FAIL } = require("../utils/json_status_text");
const errorMessage = require("../helpers/formatError");
const { accessTokenGenerated, refreshTokenGenerated } = require("../helpers/generateToken");
const asyncWrapper = require('../midelWares/asyncWrapper');
const usersModel = require('../models/users.model');
const appError = require('../utils/appError.js')
const jwt = require('jsonwebtoken');
const tokenErrorMassages = require('@utils/tokenErrorMessage');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const register = asyncWrapper(
    async (req, res, next) => {
        // Make Valdation
        const result = validationResult(req)
        if (!result.isEmpty()) {
            const error = appError.create(errorMessage(result.errors), 404, FAIL)
            return next(error)
        }

        const { firstName, lastName, email, role, password, passwordConfirm } = req.body;
        // check if User ALready Exist
        const userIsExist = await usersModel.findOne({ email: email })
        if (userIsExist) {
            const error = appError.create("This email already exists", 409, FAIL)
            return next(error)
        }

        const userData = {
            firstName,
            lastName,
            email,
            role: role || "user",
            password,
            passwordConfirm
        }
        const newUser = await usersModel.create(userData)

        // Generate verification code
        const verifyCode = newUser.createAccountVerifyCode();
        newUser.verified = false
        await newUser.save({ validateBeforeSave: false }); // validateBeforeSave => Important: because we removed passwordConfirm

        // Send email with verification code
        const emailInstance = new sendEmail({ email: newUser.email, name: newUser.firstName }, verifyCode);
        await emailInstance.verifyEmail();


        return res.status(201).json({
            status: SUCCESS,
            message: 'Registration successful. Please verify your email!',
        });


    }
)

const verifyAccount = asyncWrapper(
    async (req, res, next) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            const error = appError.create(errorMessage(result.errors), 404, FAIL)
            return next(error)
        }

        const { email, verifyCode } = req.body;
        // check if User ALready Exist
        const user = await usersModel.findOne({ email: email })

        if (!user) {
            const error = appError.create('No user found with this email.', 409, FAIL)
            return next(error)
        }

        if (!user.accountVerifyCode || !user.accountVerifyCodeExpires) {
            return next(appError.create('No verification code set. Please request a new one.', 400, FAIL));
        }

        // Check if code expired
        if (user.accountVerifyCodeExpires < Date.now()) {
            return next(appError.create('Verification code has expired.', 400, FAIL));
        }

        user.verified = true;
        user.accountVerifyCode = undefined;
        user.accountVerifyCodeExpires = undefined;
        await user.save({ validateBeforeSave: false });

        const accessToken = accessTokenGenerated(user)
        const refreshToken = refreshTokenGenerated(user)

        //' create cookies
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res
            .status(200)
            .json({
                status: SUCCESS,
                message: 'Email verified successfully!',
                data: {
                    user: {
                        email: user.email,
                        id: user._id,
                        token: accessToken
                    }
                },
            }
            )
    }
)

const resendVerificationCode = asyncWrapper(
    async (req, res, next) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            const error = appError.create(errorMessage(result.errors), 404, FAIL)
            return next(error)
        }


        const { email } = req.body;


        const user = await usersModel.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return next(appError.create('No user found with this email.', 404, FAIL));
        }

        if (user.verified) {
            return next(appError.create('Account already verified.', 400, FAIL));
        }

        // Generate a new verification code
        const verifyCode = user.createAccountVerifyCode();
        await user.save({ validateBeforeSave: false });

        // Send email with new verification code
        const emailInstance = new sendEmail({ email: user.email, name: user.firstName }, verifyCode);
        await emailInstance.verifyEmail();

        return res.status(200).json({
            status: SUCCESS,
            message: 'New verification code sent successfully.',
        });
    }
)


const login = asyncWrapper(
    async (req, res, next) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            const error = appError.create(errorMessage(result.errors), 409, FAIL)
            return next(error)
        }

        const { email, password } = req.body;        // Make Valdation
        const user = await usersModel.findOne({ email: email.toLowerCase().trim() })

        if (!user) {
            const error = appError.create("This email Not exists Please Create new Email ", 409, FAIL)
            return next(error)
        }

        // const passwordMatch = await bcrypt.compare(password, user.password)
        const passwordMatch = await user.correctPassword(password, user.password)
        if (!passwordMatch) {
            const error = appError.create("invalid Email | Password", 409, FAIL)
            return next(error)
        }

        if (!user.verified) {
            const error = appError.create('Please verify your email first.', 403, FAIL)
            return next(error)
        }


        const accessToken = accessTokenGenerated(user)
        const refreshToken = refreshTokenGenerated(user)

        //   ' create cookies
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res
            .status(200)
            .json({
                status: SUCCESS,
                message: 'Successful Login',
                data: { user: { email: user.email, id: user._id, token: accessToken } },
            })

    }
)

const logout = asyncWrapper(
    async (req, res) => {
        const cookies = req.cookies;
        console.log(req.cookies)
        // Check if the JWT cookie exists
        if (!cookies?.jwt) {
            console.log("test -- ", req.cookies)

            return res.sendStatus(204); // No JWT cookie found; send a 204 No Content response
        }

        // Clear the JWT cookie with the specified options:
        res.clearCookie('jwt', {
            httpOnly: true, // - `httpOnly: true`: Prevents client-side scripts from accessing the cookie
            sameSite: 'None', // - `sameSite: 'None'`: Allows the cookie to be sent with cross-origin requests
            secure: true, // - `secure: true`: Ensures the cookie is only transmitted over HTTPS
        });

        // Send a 200 OK response with a success message
        res.status(200).json({
            status: 'success',
            message: 'User successfully logged out and cookies cleared.',
        });
    }
)

const refresh = asyncWrapper(
    async (req, res, next) => {
        const cookies = req.cookies;

        if (!cookies?.jwt) {
            const error = appError.create('Refresh token is missing. Unauthorized access.', 401, ERROR)
            return next(error)
        }

        const refreshToken = cookies.jwt;
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {

            if (err) {
                const errorMessage = (err.name == "TokenExpiredError") ? tokenErrorMassages.expired : tokenErrorMassages.public;

                const error = appError.create(errorMessage, 403, ERROR)
                return next(error)
            }

            const userId = decoded.userInfo.id
            const userIsExist = await usersModel.findById(userId).exec();

            if (!userIsExist) {
                const error = appError.create("User not found. Unauthorized access.", 401, ERROR)
                return next(error)
            }
            // Generate a new access token with a 15-minute expiration
            const accessToken = accessTokenGenerated(userIsExist);

            // Return the new access token to the client
            return res.status(200).json({
                status: 'success',
                message: 'New access token generated successfully.',
                accessToken,
            });
        })
    }
)

const forgotPassword = asyncWrapper(
    async (req, res, next) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            const error = appError.create(errorMessage(result.errors), 409, FAIL)
            return next(error)
        }

        const { email } = req.body;        // Make Valdation
        const user = await usersModel.findOne({ email: email.toLowerCase().trim() })

        if (!user) {
            const error = appError.create("This email Not exists Please Create new Email ", 409, FAIL)
            return next(error)
        }

        const resetCode = await user.createPasswordResetCode();
        await user.save({ validateBeforeSave: false });

        new sendEmail(
            { email: user.email, name: user.firstName },
            resetCode
        ).sendResetPassword();

        res.status(200).json({
            status: SUCCESS,
            message: 'Reset Code Send To Email Successfully',
            data: null,
        });
    }
)

const resetPassword = asyncWrapper(
    async (req, res, next) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            const error = appError.create(errorMessage(result.errors), 409, FAIL)
            return next(error)
        }

        const { password, passwordConfirm, resetCode } = req.body;

        //hashing the 'Reset_Code' that receives from user
        const hashedCode = crypto
            .createHash('sha256')
            .update(resetCode)
            .digest('hex');

        const user = await usersModel.findOne({
            passwordResetCode: hashedCode,
            passwordResetExpires: { $gt: Date.now() }
        })


        if (!user) {
            const error = appError.create('Invalid or expired reset code', 409, FAIL)
            return next(error)
        }

        user.password = password;
        user.passwordConfirm = passwordConfirm;
        user.passwordResetCode = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        const accessToken = accessTokenGenerated(user)
        const refreshToken = refreshTokenGenerated(user)

        //   ' create cookies
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res
            .status(200)
            .json({
                status: SUCCESS,
                message: 'Resetting password SuccessFully',
                data: { user: { email: user.email, id: user._id, token: accessToken } },
            })

    }
)

module.exports = {
    register,
    login,
    logout,
    refresh,
    forgotPassword,
    resetPassword,
    verifyAccount,
    resendVerificationCode
}