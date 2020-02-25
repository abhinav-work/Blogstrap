const User = require('../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator/check')
const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sendGridTransport({
    auth: {
        api_key: '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'
    }
}));


exports.getLogin = (req, res, next) => {
    if(req.session.isLoggedIn)
    {
        return res.redirect('/')
    }
    let message = req.flash('error');
    if(message.length > 0)
    {
        message = message[0];
    }
    else{
        message = null;
    }
    res.render('auth/login', {
    pageTitle: "Login",
    errorMessage: message
    });
}


exports.postLogin = (req, res, next) => {
    //5da1ed93a01b4f39846ce9d7
    User.findOne({email: req.body.email})
        .then(user => {
                        if(!user)
                        {
                            req.flash('error', 'Invalid email or password');
                            return res.redirect('/login')
                        }
                        bcrypt.compare(req.body.password, user.password)
                                .then(matchFound => {
                                        if(!matchFound)
                                        {
                                            req.flash('error', 'Invalid email or password');
                                            return res.redirect('/login');
                                        }
                                        req.session.isLoggedIn = true;
                                        console.log("Master " + user.master)
                                        if(user.master)
                                        {
                                            req.session.isMaster = true;
                                        }
                                        else{
                                            req.session.isMaster = false;
                                        }
                                        console.log("is master " + req.session.isMaster)
                                        req.session.user = user;
                                        return req.session.save(err => {
                                            console.log(err)
                                            res.redirect('/');   
                                            })
                                        })
                                .catch(err => {
                                    console.log(err)
                                    const error = new Error(err);
                                    error.httpStatusCode = 500;
                                    return next(error)
                                });
                        })
        .catch(err => console.log(err));
  
}
exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err)
        res.redirect('/')
    })
}

exports.getSignUp = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/')
    }
     let message = req.flash('error');
     if (message.length > 0) 
        {
             message = message[0];
        } else {
         message = null;
        }
    res.render('auth/signup', {
        pageTitle: "Sign Up",
        nameF: req.body.nameF,
        nameL: req.body.nameL,
        age: req.body.age,
        biography: req.body.biography,
        gender: null,
        emailS: req.body.email,
        password1: req.body.password,
        password2: req.body.confirmpassword,
        errorMessage: message,
        validationErr: []
    });
}

exports.postSignUp = (req, res, next) => {
    const nameF = req.body.nameF;
    const nameL = req.body.nameL;
    const email = req.body.email;
    const age = req.body.age ;
    const biography = req.body.biography ;
    const gender = req.body.gender;
    console.log(gender)
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;
    console.log(nameF + nameL + email + age + biography + gender + password)
    const error = validationResult(req)
    if(!error.isEmpty())
    {
        console.log(error);
        return res.status(422).render('auth/signup', {
            pageTitle: "Sign Up",
            nameF: req.body.nameF,
            nameL: req.body.nameL,
            age: req.body.age,
            biography: req.body.biography,
            gender: gender,
            emailS: req.body.email,
            password1: req.body.password,
            password2: req.body.confirmpassword,
            errorMessage: error.array()[0].msg,
            validationErr: error.array()
        });
    }
         bcrypt.hash(password, 12)
                        .then(hashedPassword => {
                                                    console.log(hashedPassword)
                                                    const newUser = new User({
                                                         first_name: nameF,
                                                         last_name: nameL,
                                                         bio: biography,
                                                         gender: gender,
                                                         age: age,
                                                         email: email,
                                                         password: hashedPassword,
                                                         created_at: Date.now(),
                                                         updated_at: Date.now()
                                                    })
                                                return newUser.save();
                        })
                        .then(result => {
                                            res.redirect('/login');
                                            return transporter.sendMail({
                                                to: email, 
                                                from: 'shop@ecommerce.com',
                                                subject: "SignUp Successfull!",
                                                html: '<h1> You have successfully Signed Up </h1>'
                                            })
                                            .then(result => {
                                                console.log("Mail Sent")
                                            })
                        })
                        .catch(err => {
                            console.log(err)
                            const error = new Error(err);
                            error.httpStatusCode = 500;
                            return next(error)
                        });
}
exports.getReset = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/')
    }
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }
    res.render('auth/reset', {
        pageTitle: "Reset Password",
        errorMessage: message
    });
}

// exports.postReset = (req, res, next) => {
//     email = req.body.email;

//     crypto.randomBytes(32, (err, buffer) => {
//                 if (err) {
//                     console.log(err);
//                     return res.redirect('/')
//                 }
//                 const token = buffer.toString('hex');
//                  User.findOne({
//                          email: email
//                      })
//                      .then(user => {
//                          if (!user) {
//                              req.flash('error', "Email doesn't exist with our database");
//                              return res.redirect('/reset');
//                          }
//                          console.log('User Found! ' + token)
//                          user.lastToken = token;
//                          user.lastTokenExpiration = Date.now() + 3600000;
                        
//                          return user.save();
//                      })
//                      .then(result => {
//                          res.redirect('/');
//                          return transporter.sendMail({
//                              to: email,
//                              from: 'shop@ecommerce.com',
//                              subject: "Password Reset",
//                              html: `
//                                     <p> As per your request for the password reset </p>
//                                     <p> Here is your link, <a href="http://www.localhost:5000/reset/${token}"> Click Here </a> </p> 
//                                 `
//                          }).then(result => {
//                              console.log("Mail Sent")
//                          })
//                      })
//                      .catch(err => {
//                          console.log(err)
//                          const error = new Error(err);
//                          error.httpStatusCode = 500;
//                          return next(error)
//                      });
//         })
//     }

//     exports.getResetPassword = (req, res, next) => {
//         const token = req.params.token;
//         User.findOne({lastToken: token, lastTokenExpiration: {$gt: Date.now()}})
//                 .then(user => {
//                          if (req.session.isLoggedIn || !user) {
//                              return res.redirect('/')
//                          }
//                          let message = req.flash('error');
//                          if (message.length > 0) {
//                              message = message[0];
//                          } else {
//                              message = null;
//                          }
//                          console.log(user)
//                          res.render('auth/new-password', {
//                              pageTitle: "Reset Password",
//                              errorMessage: message,
//                              userID: user._id.toString()
//                          });
//                 })
//                .catch(err => {
//                    console.log(err)
//                    const error = new Error(err);
//                    error.httpStatusCode = 500;
//                    return next(error)
//                });
//     }

//     exports.postResetPassword = (req, res, next) => {
//         const password = req.body.password1;
//         const confirmpassword = req.body.password2;
//         console.log(req.body.userID)
//         if(password.toString()===confirmpassword.toString())
//         {
//             User.findById(req.body._id)
//                 .then(user => {
//                                     return bcrypt.hash(password, 12)
//                                                     .then(hashedPassword => {
//                                                                                     user.password = hashedPassword;
//                                                                                     user.lastToken = undefined;
//                                                                                     user.lastTokenExpiration = undefined;
//                                                                                     return user.save();
                                                                                    
//                                                     })
//                                                     .then(result => {
//                                                         res.redirect('/login');
//                                                         return transporter.sendMail({
//                                                             to: user.email,
//                                                             from: 'shop@ecommerce.com',
//                                                             subject: "Password Reset Successfull!",
//                                                             html: '<h1> You have successfully reset your password </h1>'
//                                                         })
//                                                         .then(result => {
//                                                             console.log("Mail Sent")
//                                                         })
//                                                     })      
//                                                     .catch(err => {
//                                                         console.log(err)
//                                                         const error = new Error(err);
//                                                         error.httpStatusCode = 500;
//                                                         return next(error)
//                                                     });
//                 })
//                 .catch(err => console.log(err))
//         }else{
//             console.log("Donot match")
//             req.flash('error', "Passwords don't match!")
//             res.redirect(req.get('referer'));
//         }
//     }