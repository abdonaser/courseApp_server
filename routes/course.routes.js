const {
    getAllCourser,
    UpdateCourse,
    Update_SpeceficProperty_Course,
    addCourse,
    deleteCourse,
    getCourse } = require('../controlers/coursersControlers')
const coursefieldsValidation = require('../midelWares/Validations/courseSchema_validation')
const express = require('express')
const router = express.Router()


router.route('/')
    .get(getAllCourser)
    .post(coursefieldsValidation(), addCourse)

router.route('/:courseId')
    .get(getCourse)
    .put(UpdateCourse)
    .patch(Update_SpeceficProperty_Course)
    .delete(deleteCourse)


//.get("rout" ,midd(req , res , next) , controllers(req , res , next) )



module.exports = router