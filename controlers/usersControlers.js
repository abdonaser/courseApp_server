const { validationResult } = require("express-validator");
const asyncWrapper = require("../midelWares/asyncWrapper");
const usersModel = require("../models/users.model");
const appError = require("../utils/appError");
const { SUCCESS, FAIL, ERROR } = require("../utils/json_status_text");
const errorMessage = require('../helpers/formatError.js');
const { accessTokenGenerated, refreshTokenGenerated } = require("../helpers/generateToken.js");


const getAllUsers = asyncWrapper(
    async (req, res, next) => {
        // handle Pagenation
        const { limit = 10, page = 1 } = req.query
        const skip = (page - 1) * limit

        const users = await usersModel.find({}, { "__v": false, "password": false, "passwordChangedAt": false }).limit(limit).skip(skip)
        if (!users) {
            const error = appError.create("Fails on loading Users", 404, FAIL)
            return next(error)
        }
        return res
            .status(200)
            .json({
                status: SUCCESS,
                data: {
                    "users": users
                }
            })
    }
)


const getUser = asyncWrapper(
    async (req, res, next) => {
        const userId = req.params.userId
        const user = await usersModel.findById(userId, { "password": false, "passwordChangedAt": false, "__v": false })
        if (!user) {
            const error = appError.create("user not Found", 404, FAIL)
            return next(error)
        } else {
            return res
                .status(200)
                .json({
                    status: SUCCESS,
                    data: { user }
                })
        }

    }
)


const addUser = asyncWrapper(
    async (req, res, next) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            const error = appError.create(errorMessage(result.errors), 404, FAIL)
            next(error)
        }

        const userData = req.body;
        const userExist = await usersModel.findOne({ email: userData.email })
        if (userExist) {
            const error = appError.create("This email already exists", 409, FAIL)
            return next(error)
        }

        const { firstName, lastName, email, role, verified } = await usersModel.create(userData)
        return res
            .status(201)
            .json({
                status: SUCCESS,
                data: { user: { firstName, lastName, email, role, verified } },
                message: "user added Successfully"
            })
    }
)


const updateUser = asyncWrapper(
    async (req, res, next) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            const error = appError.create(errorMessage(result.errors), 404, FAIL)
            next(error)
        }

        const { userId } = req.params;
        const updateData = req.body;

        // Check if course exists
        const userExist = await usersModel.findById(userId);

        if (!userExist) {
            const error = appError.create("user Not Found", 404, FAIL)
            next(error)
        }

        // Update user
        const updatedUser = await usersModel.findOneAndReplace(
            { _id: userId },
            updateData,
            { new: true, runValidators: true }
        );


        return res
            .status(200)
            .json({
                status: SUCCESS,
                data: { course: updatedUser },
                message: "User updated successfully"
            })



    })

const updatePatchUser = asyncWrapper(
    async (req, res, next) => {
        const { userId } = req.params;
        if (!userId) {
            const error = appError.create("please Provide userId", 409, FAIL)
            return next(error)
        }
        const updateData = { ...req.body };
        if (!updateData || Object.keys(updateData).length === 0) {
            const error = appError.create("Please provide user data", 409, "FAIL");
            return next(error);
        }

        // check if the user send a {password || passwordConfirm} in req.body
        if (updateData.password || updateData.passwordConfirm) {
            const error = appError.create(
                "This route is not for password updates. Please use /updatePassword route.",
                400,
                FAIL
            );
            return next(error);
        }

        // Check if course exists
        const userExist = await usersModel.findById(userId);
        if (!userExist) {
            const error = appError.create("user Not Found", 404, FAIL)
            next(error)
        }

        // Update user
        const updatedUser = await usersModel.findByIdAndUpdate(
            { _id: userId },
            updateData,
            { new: true, runValidators: true }
        );

        // { firstName, lastName, email, role, verified }
        return res
            .status(200)
            .json({
                status: SUCCESS,
                data: { user: updatedUser },
                message: "User updated successfully"
            })
    })

const updatePassword = asyncWrapper(
    async (req, res, next) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            const error = appError.create(errorMessage(result.errors), 404, FAIL)
            next(error)
        }

        const user = req.user
        const { currentPassword, newPassword, newPasswordConfirm } = req.body;

        const userData = await usersModel.findById(user.id).select('+password');
        if (!userData) {
            return next(appError.create("User not found", 404, FAIL));
        }

        const isMatch = await userData.correctPassword(currentPassword, userData.password)
        if (!isMatch) {
            return next(appError.create("Your current password is wrong", 401, FAIL));
        }

        if (newPassword !== newPasswordConfirm) {
            return next(appError.create("Passwords do not match", 400, FAIL));
        }

        userData.password = newPassword;
        userData.passwordConfirm = newPasswordConfirm;
        userData.passwordChangedAt = Date.now();
        await userData.save({ validateBeforeSave: false });

        const accessToken = accessTokenGenerated(userData)
        const refreshToken = refreshTokenGenerated(userData)

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
                message: 'Update password SuccessFully',
                data: { user: { email: userData.email, id: userData._id, token: accessToken } },
            })
    }
)

const deleteUser = asyncWrapper(
    async (req, res, next) => {
        const { userId } = req.params;
        if (!userId) {
            const error = appError.create("please Provide userId", 409, FAIL)
            return next(error)
        }

        const userExist = await usersModel.findById(userId);
        if (!userExist) {
            const error = appError.create("User Not Found", 404, FAIL)
            next(error)
        }

        const deletedUser = await usersModel.findByIdAndDelete(userId);

        if (deletedUser) {
            return res.status(200).json({
                status: "success",
                data: null,
                message: "User deleted successfully"
            });
        } else {
            const error = appError.create("Failed to delete User", 400, FAIL)
            next(error)
        }

    }
)


module.exports = {
    getAllUsers,
    getUser,
    addUser,
    updateUser,
    updatePatchUser,
    updatePassword,
    deleteUser
}
