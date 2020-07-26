const express = require('express');
const router = express.Router();
const path = require('path');
const productsController = require('../Controllers/admin');
const isAuth = require('../Middleware/is_auth');

const { check, body } = require('express-validator/check');
const User= require('../models/user');
const URL = require("url").URL;

const stringIsAValidUrl = (s) => {
    try {
        new URL(s);
        return true;
    } catch (err) {
        return false;
    }
};


router.get('/blogs', isAuth, productsController.getAdminBlogs);
router.get('/add-blog', isAuth, productsController.getAddBlog);
router.post('/add-blog', 
                            [   
                                body('title', 'Enter a valid Title')
                                    .isLength({ min: 3 })
                                    .isString(),
                               // body('price', 'Enter a valid Price').isFloat(),
                                body('description', 'Enter a valid Description under 10,000 word limit').isLength({ min: 5, max: 3000 }).isString()
                            ], 
                            isAuth, productsController.postAddBlog);
router.get('/edit-blog/:blogID', isAuth, productsController.getEditBlog);
router.get('/edit-user', isAuth, productsController.getEditUser);
router.post('/edit-user',
    [
        check('email')
        .isEmail()
        .withMessage("Enter Valid Email")
        .custom((value, { req }) => {
            console.log(value);
            console.log("Comparison value" + req.user.email)
            return User
                .findOne({ email: value })
                .then(user => {
                    if (value.toString()!==req.user.email.toString()) {
                        throw new Error('Email already exist!');
                    }
                    return true;
                })
        })
        .normalizeEmail(),
        body('gender').custom((value, {req}) => {
            if(value==undefined)
            {
                throw new Error('Select a Gender');
            }
        }),
        body('password', 'Password must be Alphanumerice in nature')
        .isLength({
            min: 5
        })
        //.isAlphanumeric()
        .trim(),
        body('confirmpassword').trim().custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have to match')
            }
            return true;
        })
    ],
    productsController.postEditUser);

router.post('/edit-blog/', 
                            [
                                body('title', 'Enter a valid Title')
                                .isString()
                                .isLength({ min: 3 }),
                               // body('price', 'Enter a valid Price').isFloat(),
                                body('description', 'Enter a valid Description')
                                        .isString()
                                        .isLength({ min: 5, max: 3000 })
                            ],
                            isAuth, productsController.postEditBlog);
router.delete('/delete-blog/:blogID', isAuth, productsController.deleteBlog);
router.post('/post-comment', isAuth, productsController.postComment);
router.post('/like/:blogID', isAuth, productsController.postLike)
module.exports = router;