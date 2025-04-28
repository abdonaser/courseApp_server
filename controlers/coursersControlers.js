const { validationResult } = require("express-validator");
const errorMessage = require("../helpers/formatError");
const courseModel = require("../models/course.model");
const { SUCCESS, ERROR, FAIL } = require("../utils/json_status_text");
const asyncWrapper = require("../midelWares/asyncWrapper");
const appError = require("../utils/appError");

const getAllCourser = asyncWrapper(
    async (req, res, next) => {
        // handle Pagenation
        const { limit = 10, page = 1 } = req.query
        const skip = (page - 1) * limit

        const courses_db = await courseModel.find().limit(limit).skip(skip)
        if (!courses_db) {
            const error = appError.create("Fails on loading Courses", 404, FAIL)
            return next(error)
        }
        return res
            .status(200)
            .json({
                status: SUCCESS,
                data: {
                    "courses": courses_db
                }
            })
    }
)

const getCourse = asyncWrapper(
    async (req, res, next) => {
        const courseId = req.params.courseId
        const course = await courseModel.findById(courseId)
        if (!course) {
            const error = appError.create("course not Found", 404, FAIL)
            next(error)

        } else {
            return res
                .status(200)
                .json({
                    status: SUCCESS,
                    data: { course }
                })
        }

    }
)

const addCourse = asyncWrapper(
    async (req, res, next) => {

        const result = validationResult(req)
        if (!result.isEmpty()) {
            const error = appError.create(errorMessage(result.errors), 404, FAIL)
            next(error)
        }

        const courseData = req.body;
        await courseModel.create(courseData)
        return res
            .status(201)
            .json({
                status: SUCCESS,
                data: { course: courseData },
                message: "course added Successfully"
            })
    }
)


const UpdateCourse = asyncWrapper(
    async (req, res, next) => {
        const { courseId } = req.params;
        const updateData = req.body;

        // Check if course exists
        const courseExist = await courseModel.findById(courseId);

        if (!courseExist) {
            const error = appError.create("course not Found", 404, FAIL)
            next(error)
        }

        // Update course
        const updatedCourse = await courseModel.findOneAndReplace(
            { _id: courseId },
            updateData,
            { new: true, runValidators: true }
        );


        return res
            .status(200)
            .json({
                status: SUCCESS,
                data: { course: updatedCourse },
                message: "Course updated successfully"
            })



    })

const Update_SpeceficProperty_Course = asyncWrapper(
    async (req, res, next) => {

        const { courseId } = req.params
        const newFieldsUpdated = req.body

        const courseExist = await courseModel.findById(courseId)
        if (!courseExist) {
            const error = appError.create("course not Found", 404, FAIL)
            next(error)
        }

        const courseAfterUpdating = await courseModel.findByIdAndUpdate(courseId, { $set: newFieldsUpdated }, { new: true, runValidators: true }
        )


        return res
            .status(200)
            .json({
                status: SUCCESS,
                data: { course: courseAfterUpdating },
                message: "Course updated successfully"
            })


    }
)

const deleteCourse = asyncWrapper(
    async (req, res, next) => {

        const { courseId } = req.params;

        const course = await courseModel.findById(courseId);

        if (!course) {
            const error = appError.create("course not Found", 404, FAIL)
            next(error)
        }

        const deletedCourse = await courseModel.findByIdAndDelete(courseId);

        if (deletedCourse) {
            return res.status(200).json({
                status: "success",
                data: null,
                message: "Course deleted successfully"
            });
        } else {
            const error = appError.create("Failed to delete course", 400, FAIL)
            next(error)
        }

    })




module.exports = {
    getAllCourser,
    getCourse,
    addCourse,
    UpdateCourse,
    Update_SpeceficProperty_Course,
    deleteCourse,
}