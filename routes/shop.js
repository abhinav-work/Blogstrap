const express= require('express');
const router = express.Router();
const blogController = require('../Controllers/blog')
const isAuth = require('../Middleware/is_auth');

router.get('/', blogController.getBlogs);
router.get('/blogs/:blogID', blogController.getBlog);
router.get('/home', blogController.getHome);
// router.get('/cart', isAuth, isCustom, productController.getCart);
// router.post('/cart', isAuth, isCustom, productController.postCart);
// router.post('/delete-cart-item', isAuth, isCustom, productController.postDeleteCartProduct);
//  router.get('/orders', isAuth, isCustom, productController.getOrders);

// router.get('/orders/:orderID', isAuth, isCustom,productController.getInvoice)
// router.get('/checkout', isAuth, isCustom, productController.getCheckout)
 module.exports = router;