const passport = require('passport')
const express = require('express');
const userController = require("../../../controller/user.controller")
const router = express.Router();
require("../../../utils/provider"); // Ensure Passport config is loaded
const {authenticateToken} =require('../../../middleware/auth')
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/verify-email', userController.verifyEmail);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:token', userController.resetPassword);
router.post('/logout', userController.logout);
router.delete('/delete-account', userController.deleteAccount);
module.exports = router;