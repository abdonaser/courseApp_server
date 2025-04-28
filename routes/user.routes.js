const { getAllUsers, addUser, getUser, updateUser, updatePatchUser, deleteUser, updatePassword } = require('../controlers/usersControlers')
const { rgisterValidation, updateMyPasswordValidation } = require('../midelWares/Validations/usersSchema_validation')
const express = require('express')
const verifyJWT = require('../midelWares/verifyJWT')
const checkRole = require('../midelWares/permisions/checkRole')
const { Admin, Manager, User } = require('../utils/permissions')
const router = express.Router()

router.use(verifyJWT)

router.patch(
    '/me/updatemypassword', updateMyPasswordValidation(), checkRole([Admin, Manager, User]), updatePassword
);

router.route('/')
    .get(checkRole([Admin, Manager, User]), getAllUsers)
    .post(rgisterValidation(), checkRole([Admin]), addUser)

router.route('/:userId')
    .get(checkRole([Admin, Manager]), getUser)
    .put(rgisterValidation(), checkRole([Admin, Manager]), updateUser)
    .patch(checkRole([Admin, Manager]), updatePatchUser)
    .delete(checkRole([Admin]), deleteUser)


module.exports = router