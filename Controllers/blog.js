const Blog = require('../models/blog');
const { Types } = require('mongoose');
const blog = require('../models/blog');
const ITEMS_PER_PAGE = 4; 
const WIDGET_LIMIT = 3;
const FOOTER_LIMIT = 3;
exports.getBlogs = async(req, res, next) => {
    const page = +req.query.page || 1;
    var totalItems = await Blog.countDocuments();
    const blogQuery = [
        {
            $lookup:{
                from: 'comments',
                let: { id : '$_id'},
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {$eq: ['$post_id', '$$id'] }
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            count: {$sum: 1}
                        }
                    }
                ],
                as: 'postComments'
            }
        },
       {
           $unwind: {
               path: '$postComments',
               preserveNullAndEmptyArrays: true
           }
       },
        {
            $project: {
                title: '$title',
                description: '$description',
                author_name: '$author_name',
                updated_at: '$updated_at',
                image_URL: '$image_URL',
                totalComments: {$ifNull: ['$postComments.count', 0]},
                likes: '$likes.totalQty'
            }
        },
        {
            $facet: {
                main: [
                     {
                         $sort: {
                             'updated_at': -1
                         }
                     }, {
                         $skip: (page - 1) * ITEMS_PER_PAGE
                     }, {
                         $limit: ITEMS_PER_PAGE
                     }
                ],
                widgets: [
                     {
                         $sort: {
                             'totalComments': -1
                         }
                     }, {
                         $limit: WIDGET_LIMIT
                     }
                ],
                footer: [
                    { $sort: { 'updated_at': -1 } },
                    { $limit: FOOTER_LIMIT }
                ],
            }
        },
    ]
    let blogs = await Blog.aggregate(blogQuery)
    blogs = blogs[0]
    res.render('user/blog-list', {
                blogs: blogs.main,
                widgets: blogs.widgets,
                footer: blogs.footer,
                pageTitle: "Blog",
                totalBlogs: totalItems,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
                currentPage: page,
                admin: false
            });
};

exports.getBlog = async(req, res, next) => {
   const id = req.params.blogID;
   console.log(id)
   const blogQuery = [
       {
           $lookup:{
               from: 'comments',
               let: {id: '$_id'},
               pipeline: [{
                       $match: {
                           $expr: {
                               $and: [{
                                   $eq: ['$post_id', '$$id']
                               }]
                           }
                       }
                   },
               ],
               as: 'postComments'
           }
       },
       {
           $project: {
               title: '$title',
               description: '$description',
               quote: '$quote',
               quoteAuthor: '$quoteAuthor',
               author_name: '$author_name',
               updated_at: '$updated_at',
               image_URL: '$image_URL',
               totalComments: {$ifNull: [{$size: '$postComments'}, 0]},
               comments: '$postComments',
               likes: '$likes.totalQty',
               likeList: '$likes.users'
           }
       },
       {
           $sort: { '_id': 1 }
       },
       {
           $facet: {
               widgets: [
                   {
                       $sort: {
                           'totalComments': -1
                       }
                   }, {
                       $limit: WIDGET_LIMIT
                   }
               ],
               firstAndLastPage: [
                   {
                       $group: {
                           _id: null,
                           first: { $first: '$$ROOT' },
                           last: {$last: '$$ROOT'}
                       }
                   }
               ],
               nextPage: [
                {
                    $match: {
                        $expr:{$gt: ['$_id', Types.ObjectId(id)]}
                    }
                },
                {$limit: 1}
               ],
               previousPage: [
                {
                   $sort: { '_id': -1 }
                },
                {
                   $match: {
                       $expr: { $lt: ['$_id', Types.ObjectId(id)] }
                   }
                },  
                { $limit: 1 }
               ],
               item: [
                   {
                       $match: { _id: Types.ObjectId(id) }
                   }
               ],
               footer: [
                   {$sort: {'updated_at': -1}},
                   {$limit: FOOTER_LIMIT}
               ],
           }
       },
       {
           $unwind: {
                path: '$item',
                preserveNullAndEmptyArrays: true
            }
       },
       {
           $unwind: {
               path: '$previousPage',
               preserveNullAndEmptyArrays: true
           }
       },
       {
           $unwind: {
               path: '$nextPage',
               preserveNullAndEmptyArrays: true
           }
       }, 
       {
           $unwind: {
               path: '$firstAndLastPage',
               preserveNullAndEmptyArrays: true
           }
       },
   ]
  
    let blog = await Blog.aggregate(blogQuery)
    blog = blog[0];
    let val = false;

    if (req.session.isLoggedIn && blog.item)
    {
        blog.item.likeList.forEach(p => {
            if (p.userID.toString() === req.user._id.toString())
            {
                    val = true.toString();
            }
        })
    }    
   
    return res.render('user/blog-detail', {
        widgets: blog.widgets,
        blog: blog.item,
        nextBlog: blog.nextPage || blog.firstAndLastPage.first,
        prevBlog: blog.previousPage || blog.firstAndLastPage.last,
        footer: blog.footer,
        like: val,
        pageTitle: "Blog",
        admin: false
    })
};

exports.getHome = async(req, res, next) => {
    const homeQuery = [
        {
            $lookup:{
                from: 'comments',
                let: {id: '$_id'},
                pipeline: [
                    {
                        $match:{
                            $expr: { $eq: ['$post_id', '$$id']}
                        }
                    },
                    {
                        $group:{
                            _id: null,
                            count: {$sum: {$cond: ['$_id', 1, 0]}}
                        }
                    }
                ],
                as: 'postComments'
            }
        },
        {
            $project: {
                title: '$title',
                description: '$description',
                author_name: '$author_name',
                updated_at: '$updated_at',
                image_URL: '$image_URL',
                totalComments: { $ifNull: ['$postComments.count', 0] },
                likes: '$likes.totalQty',
            }
        },
        {
            $facet: {
                trending: [
                    {$sort: {'totalComments': -1}},
                    {$limit: FOOTER_LIMIT}
                ],
                latest: [
                    {$sort: {'updated_at': -1}},
                    {$limit: FOOTER_LIMIT}
                ]
            }
        }
    ]
    let home = await Blog.aggregate(homeQuery)
    home = home[0];
    return res.render('user/home', {
        trending: home.trending,
        latest: home.latest,
        footer: home.latest,
        pageTitle: "Home",
    });
}


