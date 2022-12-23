const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.Schema({
userId: {
    type:ObjectId, 
    ref:"User", 
    //required:true, 
    unique:true
},
items: [{
  productId: {
    type:ObjectId, 
    ref:"Product", 
    required:true
},
  quantity: {
    type:Number, 
    required:true, 
    // min 1
}
}],
totalPrice: {                     //comment: "Holds total price of all the items in the cart"
    type:Number, 
    required:true, 
    
},
totalItems: {                     //comment: "Holds total number of items in the cart"
    type:Number, 
    required:true, 
    
},
},{ timestamps: true })

module.exports = mongoose.model("Cart", cartSchema)