const { getAllUsers, addUser, getUser, updateUser, deleteUser } = require('../controlers/usersControlers')
const { rgisterValidation } = require('../midelWares/Validations/usersSchema_validation')
const express = require('express')
const verifyJWT = require('../midelWares/verifyJWT')
const checkRole = require('../midelWares/permisions/checkRole')
const { Admin, Manager, User } = require('../utils/permissions')
const router = express.Router()

router.use(verifyJWT)

router.route('/')
    .get(checkRole([Admin, Manager, User]), getAllUsers)
    .post(rgisterValidation(), checkRole([Admin]), addUser)

router.route('/:userId')
    .get(checkRole([Admin, Manager]), getUser)
    .put(rgisterValidation(), checkRole([Admin, Manager]), updateUser)
    .delete(checkRole([Admin]), deleteUser)

module.exports = router