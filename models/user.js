const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    first_name:{
        type: String
    },
    last_name: {
         type: String
     },
    email:{
        type: String
    },
    password:{
        type: String,
        required: true
    },
   bio: {
       type: String
   },
   gender: {
       type: String
   },
   age: {
       type: Number
   },
   created_at: {
       type: Date
   },
   updated_at: {
       type: Date
   }
})

userSchema.methods.addToCart = function (product)
{
    const cartProductIndex = this.cart.items.findIndex(p => {
                            return p.productId.toString() === product._id.toString();
                       })
                       let cartQuantity = 1;
                      let updatedCartItems = [...this.cart.items];

                       if(cartProductIndex>=0)
                       {
                           cartQuantity = this.cart.items[cartProductIndex].quantity + 1;
                           updatedCartItems[cartProductIndex].quantity = cartQuantity;
                           console.log("Quantity " + cartQuantity);
                       }
                       else{
                           updatedCartItems.push({ productId: product._id, quantity: cartQuantity });
                       }
                        const updatedCart = { items: updatedCartItems}
                       this.cart = updatedCart;

                        return this.save();
}

userSchema.methods.deleteFromCart = function (prodID) 
{
                     const updatedItems = this.cart.items.filter(p => {
                         return p.productId.toString() !== prodID.toString()
                     })
                     //console.log(updatedItems);
                     const updatedCart = {items: updatedItems}
                     this.cart = updatedCart;
                     return this.save();
                    
}

userSchema.methods.cleanCart = function ()
{
    this.cart = { items: [] };
    this.save();
}

module.exports = mongoose.model('User', userSchema);
// const mongodb = require('mongodb');
// const ObjectId = mongodb.ObjectId;
// const getDb = require('../utilities/database').getDb;

// class User {
//     constructor(username, email, cart, id){
//     this.username = username;
//     this.email = email;
//     this.cart = cart;
//     this._id = id;
// }   

//     save(){
//             const db = getDb();
//             //let oP;

//             return db
//                     .collection('users')
//                     .insertOne(this)
//                     .then(user => console.log("here is your user " + user))
//                     .catch(err => console.log(err)) 
//     }

//     addToCart(product){
        
//         const cartProductIndex = this.cart.items.findIndex(p =>{
//             return p.productId.toString() === product._id.toString();
//        })
//        let cartQuantity = 1;
//       let updatedCartItems = [...this.cart.items];

//        if(cartProductIndex>=0)
//        {
//            cartQuantity = this.cart.items[cartProductIndex].quantity + 1;
//            updatedCartItems[cartProductIndex].quantity = cartQuantity;
//            console.log("Quantity " + cartQuantity);
//        }
//        else{
//            updatedCartItems.push({ productId: new ObjectId(product._id), quantity: cartQuantity });
//        }
//         const updatedCart = { items: updatedCartItems}
//             //[{productId: new ObjectId(product._id), quantity: 1 }]
//        // };
//         const db = getDb();

//         return db
//                 .collection('users')
//                 .updateOne({_id: new ObjectId(this._id)},
//                             {$set: {cart: updatedCart} } );
//     }

//     getCart(){
//             const db = getDb();

//             const productIDs = this.cart.items.map(i => {
//                 return i.productId;
//             })
//             return db
//                         .collection('products')
//                         .find({_id: { $in: productIDs }})
//                         .toArray()
//                         .then(products => {
//                             return products.map(p => {
//                                 return{
//                                     ...p, quantity: this.cart.items.find(j => {
//                                         return j.productId.toString() === p._id.toString();
//                                     }).quantity 
//                                 }
//                             })
//                         })
//     }

//     deleteItemFromCart(productID){
//         const db  = getDb();
//         const updatedCart = this.cart.items.filter(p => {
//            return p.productId.toString() !== productID.toString();
//         })

//          return db
//                 .collection('users')
//                  .updateOne({
//                                  _id: new ObjectId(this._id)
//                             }, {
//                             $set: {
//                                      cart: {items: updatedCart}
//                                   }
//                             });
//     }

//     addOrder(){
//         const db  = getDb();
//        return this.getCart().then(products => {
//             const order = {
//                 items: products,
//                 user: {
//                     _id: new ObjectId(this._id),
//                     name: this.username
//                 }
//             };
//            return db
//                .collection('orders')
//                .insertOne(order)
//         })
        
        
//                     .then(result =>{
//                                        this.cart = {items: [] };
//                                         return db
//                                                   .collection('users')
//                                                   .updateOne(
//                                                                 {_id: new ObjectId(this._id)},
//                                                                 {$set: {cart: {items: [] } }}
//                                                                 )
//                                                   .then(final => {
//                                                                     return final})
//                                                   .catch(err => console.log(err));
                                                     
//                     })
//     }

//     getOrder(){
//         const db = getDb();
//         return db
//                     .collection('orders')
//                     .find({ 'user._id': new ObjectId(this._id) })
//                     .toArray()
//                     .catch(err => console.log("Error in getting the orders " + err))
//     }

//     static findByID(userId){
//         const db = getDb();
//         return db
//                     .collection('users')
//                     .findOne({_id: new ObjectId(userId)})
//                     .then(user => {
//                                         console.log(user);
//                                         return user;
//                                     })
//                     .catch(err => console.log(err))
//     }
// }

// module.exports = User;