const express = require('express');
const router = express.Router();
const { check, body } = require('express-validator/check');
const authController = require('../Controllers/auth');
const User = require('../models/user')

router.get('/login', authController.getLogin);
router.post('/login', 
                        [
                            check('email')
                                .isEmail()
                                .withMessage("Enter Valid Email")
                                .normalizeEmail(),
                             body('password', 'Password must be Alphanumerice in nature')
                                 .isLength({ min: 5 })
                                 .isAlphanumeric()
                                 .trim()
                        ],
                        authController.postLogin);
router.post('/logout', authController.postLogout);
router.get('/signup', authController.getSignUp);
router.post('/signup', 
                        [
                            check('email')
                                    .isEmail()
                                    .withMessage("Enter Valid Email")
                                    .custom((value, { req }) => {
                                        console.log(value);
                                        return User
                                            .findOne({ email: value })
                                            .then(user => {
                                                    if (user) {
                                                                    throw new Error('Email already exist!');
                                                              }
                                                              return true;
                                                })
                                            })
                                    .normalizeEmail(),
                                        body('gender').custom((value, {
                                            req
                                        }) => {
                                            if (value == undefined) {
                                                throw new Error('Select a Gender');
                                            }
                                            return true
                                        }),
                            body('password', 'Password must be Alphanumerice in nature')
                                    .isLength({min: 5})
                                    .isAlphanumeric()
                                    .trim(),
                            body('confirmpassword').trim().custom((value, { req }) => {
                                if(value !== req.body.password)
                                {
                                    throw new Error('Passwords have to match')
                                }
                                return true;
                            })
                        ],
                            authController.postSignUp);
// router.get('/reset', authController.getReset);
// router.post('/reset', authController.postReset);
// router.get('/reset/:token', authController.getResetPassword);
// router.post('/reset_password',
//                                 [
//                                     check('email')
//                                     .isEmail()
//                                     .withMessage("Enter Valid Email")
//                                     .normalizeEmail(),
//                                     body('password', 'Password must be Alphanumerice in nature')
//                                     .isLength({
//                                         min: 5
//                                     })
//                                     .isAlphanumeric()
//                                     .trim()
//                                 ],
//                                 authController.postResetPassword);
module.exports = router;