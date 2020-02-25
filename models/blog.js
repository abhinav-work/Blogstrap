const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const blogSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    image_URL:{
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    author_name: {
            type: String,
            required: true
    },
    likes: {
             totalQty: {
                            type: Number
             },   
             users: [
                        {
                            userID: {
                                type: Schema.Types.ObjectId,
                                ref: 'User',
                                required: true
                            }
                        }
             ]
                
    },
    comments: {
                type: Number
    },
    created_at: {
        type: Date,
        required: true
    },
    updated_at: {
        type: Date,
        required: true
    },
    quote:{
        type: String
    },
    quoteAuthor: {
        type: String
    }

});



module.exports = mongoose.model('Blog', blogSchema);


// // const fs = require('fs');
// // const path = require('path');
// const mongodb = require('mongodb');
// const ObjectId = mongodb.ObjectId;
// const getDb = require("../utilities/database").getDb;

// const Cart = require('./cart');

// // const p = path.join(
// //   path.dirname(process.mainModule.filename),
// //   'data',
// //   'products.json'
// // );

// // const getProductsFromFile = cb => {
// //   fs.readFile(p, (err, fileContent) => {
// //     if (err) {
// //       cb([]);
// //     } else {
// //       cb(JSON.parse(fileContent));
// //     }
// //   });
// // };
// class Product 
//   {
//                 constructor(title, imageURL, imageURL2, imageURL3, description, price, id, userId)
//                  {
//                       this.title = title;
//                       this.imageURL = imageURL;
//                       this.imageURL2 = imageURL2;
//                       this.imageURL3 = imageURL3;
//                       this.description = description;
//                       this.price = price;
//                       this._id = id ? new ObjectId(id) : null;
//                       this.userId = userId;
//                   }
  
//                   save() 
//                   {
//                       const db = getDb();
//                       let oP;
//                       if(this._id)
//                       {
//                         oP = db
//                                 .collection('products')
//                                 .updateOne({ _id: this._id}, { $set: this });
                                      
//                       }
//                       else{

//                            oP = db
//                                   .collection('products')
//                                   .insertOne(this)
//                       }    
//                     return oP
//                                .then(result => console.log(result))
//                                .catch(err => console.log(err));;
//                    }   
                   
//                    static fetchAll() 
//                    {
//                      const db  = getDb();
//                      return db    
//                               .collection('products')
//                               .find()
//                               .toArray()
//                               .then(products => {
//                                                     return products;
//                                                   })
//                               .catch(err => console.log(err))
//                    }

//                    static findByID(prodID)
//                    {
//                      const db  = getDb();
//                      return db
//                               .collection('products')
//                               .find({_id: new mongodb.ObjectId(prodID) })
//                               .next()
//                               .then(product => {
//                                                   return product;
//                                                 })
//                               .catch(err => console.log("Error in Finding the specific product" + err))
//                    }

//                    static deleteByID(prodID)
//                    {
//                      const db = getDb();
//                      return db.
//                                 collection('products')
//                                 .removeOne({_id: new ObjectId(prodID)})
//                                 .then(result => {
//                                                   console.log(result);
//                                 })
//                                 .catch(err => console.log(err))
//                    }
//   }
// //     getProductsFromFile(products => {

// //       if(this.id)
// //       {
// //           const existingProductIndex = products.findIndex(prods => prods.id === this.id); 
// //           console.log("Product Found");
// //           const updatedProducts = [...products];
// //           updatedProducts[existingProductIndex] = this;
// //           fs.writeFile(p, JSON.stringify(updatedProducts), err =>  console.log(err) );
// //       }
// //       else {
// //                 console.log("New Product added!");
// //                 this.id = Math.random().toString();
// //                 products.push(this);
// //                 fs.writeFile(p, JSON.stringify(products), err => console.log(err) );   
// //           }
// //     });
// //   }
// //   static deleteByID(id){
// //     getProductsFromFile(products => {
// //       const product = products.find(prod => prod.id === id);
// //       const updatedProducts = products.filter(p => p.id !== id);
// //       fs.writeFile(p, JSON.stringify(updatedProducts), err => 
// //       {
// //         if(!err)
// //         {
// //           Cart.deleteProduct(id, product.price); 
// //         }
// //       });
// //     });

// //   }


// //   static findByID(id, cb){
// //     getProductsFromFile(products =>{
// //       const product = products.find(p => p.id === id);
// //       cb(product);
// //     })
// //   }

// //   static fetchAll(cb) {
// //     getProductsFromFile(cb);
// //   }
// // };

// module.exports = Product;