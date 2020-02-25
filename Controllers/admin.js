var Blog = require('../models/blog');
var User = require('../models/user');
const Comment = require('../models/comments')
const { validationResult } = require('express-validator/check')
const fileHelper = require('../utilities/file');
const ITEMS_PER_PAGE = 4;
const bcrypt = require('bcryptjs');

exports.getAddBlog = (req, res, next) => {
    res.render('admin/edit-blog',
        { pageTitle: 'Add Blog',
            editing: false,
            hasError: false,
            errorMessage: null,
            validationErr: []
        }
    );
};

exports.postAddBlog = (req, res, next) => 
{
    const title = req.body.title;
    console.log(title);
    const image_URL = req.body.image_URL
    const description = req.body.description;
    const quote = req.body.quote;
    const quoteAuthor = req.body.quoteAuthor;
     const errors = validationResult(req);
    

     if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-blog', {
             pageTitle: 'Add Blog',
             editing: false,
             hasError: true,
             blog: {
                 title : title,
                 description: description,
                 image_URL: image_URL,
                 quote: quote,
                 quoteAuthor: quoteAuthor
             },
             errorMessage: errors.array()[0].msg,
             validationErr: errors.array()
         });
     }

        
        // if(!title || !imageURL || !description || !price )
        //     {   
        //         console.log("NULLIFY");
        //         res.redirect('/admin/adminproduct'); 
        //     }
        // else if (title && imageURL && description && price)
        
            console.log("SumLIFY");
            const blog = new Blog({
                title: title, 
                image_URL: image_URL,
                description: description, 
                author: req.user,
                quote: quote,
                quoteAuthor: quoteAuthor,
                author_name: req.user.first_name + " " + req.user.last_name,
                "likes.totalQty": 0, 
                created_at: Date.now(),
                updated_at: Date.now(),
                comments: 0
               });
             console.log(blog)
            blog.save()
                    .then(result => {
                            console.log("Created a Blog Successfully");
                           
                            res.redirect("/");
                        })
                    .catch(err => {
                        console.log(err)
                        const error = new Error(err);
                        error.httpStatusCode = 500;
                        return next(error)
                    });
};

exports.getEditBlog = (req, res, next) => {
    const editMode= req.query.edit;
    if(editMode!="true"){
        return res.redirect('/')
    }
    const blogID = req.params.blogID;

    Blog.findById(blogID)
            .then(blog => {
                                if(!blog)
                                {
                                    res.redirect('/')
                                }
                                console.log("ID is "+ blogID )
                                res.render('admin/edit-blog',{
                                        pageTitle: 'Edit Blog',
                                        editing: editMode,
                                        hasError: false,
                                        blog: blog,
                                        errorMessage: null,
                                        validationErr: []
                                         });
                        })
            .catch(err => {
                console.log(err)
                  const error = new Error(err);
                  error.httpStatusCode = 500;
                  return next(error)
            });
};

exports.postEditBlog = (req, res, next) => {
     var objectID = require("mongodb").ObjectID;
    const blogID = req.body.blogID;
    const updatedTitle = req.body.title;
    const updatedImage_URL = req.body.image_URL;
    const updatedDescription = req.body.description;
    const updatedQuote = req.body.quote;
    const updatedQuoteAuthor = req.body.quoteAuthor;
    console.log( "EDit ID is " + blogID + "h")
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
         //console.log(errors.array())
         return res.status(422).render('admin/edit-blog', {
                                                                pageTitle: 'Add Blog',
                                                                editing: true,
                                                                hasError: true,
                                                                blog: {
                                                                    title: updatedTitle,
                                                                    image_URL: updatedImage_URL,
                                                                    description: updatedDescription,
                                                                    quote: updatedQuote,
                                                                    quoteAuthor: updatedQuoteAuthor,
                                                                    _id: blogID
                                                                 },
                                                                    errorMessage: errors.array()[0].msg,
                                                                    validationErr: errors.array()
         });
     }
   
    Blog.findById(blogID)
                .then(blog => {
                                        
                                        if(blog.author.toString()!==req.user._id.toString())
                                        {
                                            return res.redirect('/')
                                        }
                                        console.log("FOUND!!!!")
                                        console.log(req.user._id)
                                        blog.title = updatedTitle
                                        blog.image_URL = updatedImage_URL;
                                        blog.description = updatedDescription;
                                        blog.author= req.user;
                                        blog.updated_at = Date.now();
                                        blog.quote = updatedQuote;
                                        blog.quoteAuthor = updatedQuoteAuthor;
                                        return blog.save()
                                                        .then(result => {
                                                            res.redirect('/');
                                                        })
                                                        .catch(err =>  console.log(err))
                })
                .catch(err => {
                    console.log(err)
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error)
                });
};

exports.getAdminBlogs = (req, res, next) => {
    const page = +req.query.page || 1;
    var totalItems;
    Blog.find({author: req.user})
        .countDocuments()
        .then(numBlogs => {
            totalItems = numBlogs;
           // console.log(totalItems)
            return Blog.find({ author: req.user._id })
                            .skip((page - 1) * ITEMS_PER_PAGE)
                            .limit(ITEMS_PER_PAGE)  
        })
        .then(blog => {
                                res.render('admin/blogs', {
                                    blogs: blog,
                                    pageTitle: "Admin Blogs",
                                    totalBlogs: totalItems,
                                        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                                        hasPreviousPage: page > 1,
                                        nextPage: page + 1,
                                        previousPage: page - 1,
                                        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
                                        currentPage: page,
                                        admin: true
                                });
                             })
        .catch(err => {
                console.log(err)
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error)
            });
};

exports.getEditUser = (req, res, next) => {
    console.log("In User")
    let message = req.flash('error');
    if (message.length > 0) 
    {
        message = message[0];
    } else 
    {
        message = null;
    }
    res.render('admin/edit-user', {
        pageTitle: "Edit User",
        nameF: req.user.first_name,
        nameL: req.user.last_name,
        age: req.user.age,
        biography: req.user.bio,
        gender: req.user.gender,
        emailS: req.user.email,
        password1: req.user.password,
        password2: req.user.password,
        errorMessage: message,
        validationErr: []
    });
}

exports.postEditUser = (req, res, next) => {
    const nameF = req.body.nameF;
    const nameL = req.body.nameL;
    const email = req.body.email;
    const age = req.body.age;
    const biography = req.body.biography;
    const gender = req.body.gender;
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;
    console.log(nameF + nameL + email + age + biography + gender + password)
    console.log("Gender" + gender)
    const error = validationResult(req)
    if (!error.isEmpty()) {
        console.log(error);
        return res.status(422).render('admin/edit-user', {
            pageTitle: "Edit User",
            nameF: req.body.nameF,
            nameL: req.body.nameL,
            age: req.body.age,
            biography: req.body.biography,
            gender: req.body.gender,
            emailS: req.body.email,
            password1: req.body.password,
            password2: req.body.confirmpassword,
            errorMessage: error.array()[0].msg,
            validationErr: error.array()
        });
    }
    if(password.toString()===confirmpassword.toString())
    {    
        User.findOne({_id: req.user})
            .then(user => {
                                    bcrypt.hash(password, 12)
                                        .then(hashedPassword => {
                                                console.log(hashedPassword);
                                                
                                                    user.first_name = nameF,
                                                    user.last_name =nameL,
                                                    user.bio = biography,
                                                    user.gender =  gender,
                                                    user.age = age,
                                                    user.email = email,
                                                    user.password = hashedPassword,
                                                    
                                                    user.updated_at= Date.now()
                                                
                                                return user.save()
                                                                .then(res => {
                                                                                    console.log('User Updated');
                                                                })
                                        })

            })
            .then(result => {
                res.redirect('/admin/blogs');
            })
            .catch(err => {
                console.log(err)
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error)
            });
        }
        else
            res.redirect('/admin/edit-user')
}

exports.deleteBlog = (req, res, next) => {
     var currentPage = +req.query.page || 1;
    const blogID = req.params.blogID;
    Blog.findById(blogID)
                .then(blog => {     
                                    return Blog
                                        .deleteOne({
                                            _id: blogID,
                                             author: req.user._id
                                        })
                                        
                })
                .then(res => {
                                    Comment.find({post_id: blogID})
                                            .then(comm => {
                                                                return Comment.deleteMany({
                                                                    post_id: blogID
                                                                })
                                                })
                                            .catch(err => {
                                                                console.log("Error in Deleting Comments" + err )
                                            })
                })
                .then(blog => {
                     res.status(200).json({
                         message: 'Success!!'
                     });
               })
                .catch(err => {
                    console.log(err)
                    res.status(500).json({message: "Deletion of the blog failed!"})
                });
    };

exports.postComment = (req, res, next) => {
    const blogID = req.body.blogID
    // console.log("Blog comment " + blogID)
    const comment = req.body.usercomment;
    const newComment = new Comment({
        comments: comment,
        commented_by: {
                        email: req.user.email,
                        userID: req.user._id,
                      },
        post_id: blogID,
        created_at: Date.now(),
        updated_at: Date.now()
    })
    newComment.save()
                .then(result => {
                                console.log("Success in posting comment!")
                                Blog.findById(blogID)
                                        .then(blog => {
                                                            blog.comments++;
                                                            blog.save()
                                                                    .then(res => console.log("Comment++"))
                                        })
                                res.redirect(`/blogs/${blogID}`);
                })
                .catch(err => {
                    console.log(err)
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error)
                });
}
exports.postLike = (req, res, next) =>{
    const blogID = req.params.blogID;
    const like = req.query.like;
      console.log(blogID + "  " + like)
      Blog.findById(blogID)
        .then( blog =>{
                                        var value=false;

                                        blog.likes.users.forEach( p => {
                                            if(p.userID.toString()===req.user._id.toString())
                                            {
                                                console.log("User Found")
                                                value = true;
                                            }
                                        })
                                        
                                        if(value==true)
                                        {
                                                 console.log("-1")
                                                 blog.likes.totalQty = blog.likes.totalQty - 1;
                                                 blog.likes.users = blog.likes.users.filter(element => {
                                                     return (element.userID.toString() !== req.user.id.toString())
                                                 })
                                        }
                                        else
                                        {
                                                console.log("+1")
                                                blog.likes.totalQty = blog.likes.totalQty + 1;
                                                blog.likes.users.push({ userID: req.user._id })
                                        }
                            
                                        blog.save()
                                            .then(res=> {
                                                            console.log("Like Update")
                                            })
                                            .catch(err => console.log(err));
                                        
                })
             .catch(err => {
                 console.log(err)
                 const error = new Error(err);
                 error.httpStatusCode = 500;
                 return next(error)
             });
}