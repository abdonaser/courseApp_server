const { validationResult } = require("express-validator");
const asyncWrapper = require("../midelWares/asyncWrapper");
const usersModel = require("../models/users.model");
const appError = require("../utils/appError");
const { SUCCESS, FAIL, ERROR } = require("../utils/json_status_text");



const getAllUsers = asyncWrapper(
    async (req, res, next) => {
        console.log("getAllUsers Scope")
        // handle Pagenation
        const { limit = 10, page = 1 } = req.query
        const skip = (page - 1) * limit

        const users = await usersModel.find({}, { "__v": false, "password": false, }).limit(limit).skip(skip)
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
        const user = await usersModel.findById(userId)
        if (!user) {
            const error = appError.create("user not Found", 404, FAIL)
            next(error)

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
        const userInfo = await usersModel.create(userData)
        console.log("userinfo", userInfo)
        return res
            .status(201)
            .json({
                status: SUCCESS,
                data: { user: userInfo },
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


const deleteUser = asyncWrapper(
    async (req, res, next) => {

        const { userId } = req.params;

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
    deleteUser

}
