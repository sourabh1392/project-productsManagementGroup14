const cartModel=require("../model/cartModel")
const userModel= require("../model/userModel")
const productModel= require("../model/productModel")
const {isValidObjectIds }= require("../validator/validation")

// //=======================================Create Cart===========================================================
// const createCart= async function(req,res){
//     try{
//         let data= req.body
//         let { cartId, items, totalPrice, totalItems}= data
//         let userId= req.params.userId
//         let findUser= await userModel.findById({userId})
//         if(!findUser) return res.status(400).send({status:false, message:"user does not exist"})
//         data.userId= userId
//        if(!isValidObjectIds(userId)) return res.status(400).send({status:false, message:"enter valid userId"})
//        let userFind= await cartModel.findOne({userId})
//        if(userFind){
//         if(!cartId) return res.status(400).send({status:false, message:"enter cartId"})
//            if(!isValidObjectIds(cartId)) return res.status(400).send({status:false, message:"enter valid cartId"})
//           if(cartId!= userFind._id) return res.status(404).send({status:false, message:"cart does not exist"})
//           for(let i=0; i<userFind.items.length; i++){
//            let arr = userFind.items[i]
//            console.log(arr)
//            if(!isValidObjectIds(items[0].productId)) return res.status(400).send({status:false, message:"enter valid productId"})
//            if(items[0].productId== arr.productId){
//                arr.quantity=arr.quantity+1 
//             }
//             let addProduct= userFind.items.push(items[0]).save()
//             if(addProduct){
//             userFind.totalItems= userFind.totalItems+1 }}
            
//             return res.status(200).send({status:true,data: userFind})
//         }else{
//            if(!totalPrice) return res.status(400).send({status:false, message:"totalprice is mandatory"})

//            if(!totalItems) return res.status(400).send({status:false, message:"totalItems is mandatory"})
//         if(!userId)  return res.status(400).send({status:false, message:"userid is mandetory"})
//         if(items){
//         for(let i=0;i<items.length;i++){
//           let m= items[i].productId
//           let j= items[i].quantity
//           console.log(items[i])
//         if(!m) return res.status(400).send({status:false, message:"productid is mandetory"})
//         if(!j) return res.status(400).send({status:false, message:"quantity is mandetory"})
    
//         }}
//            let createcart= await cartModel.create(data)
//         return res.status(200).send({status:true, data: createcart})
//        }
//     }
//     catch(err){
//         return res.status(500).send({status:false, message:err.message})
//     }
// }

// //=======================================Get Cart===========================================================

// const getCart= async function(req,res){
//     try{
//         let userId= req.params.userId
//         if(isValidObjectIds(userId)) return res.status.send({status:false, message:"enter valid userId"})
//         let findCart= await cartModel.findOne({userId})
//         if(!findCart)  return res.status.send({status:false, message:"cart does not exist"})

//     }catch(err){
//         return res.status(500).send({status:false, message:err.message})
//     }
// }
// module.exports= { createCart, getCart}
//const {cartModel,productModel,orderModel}=require("../model")
//const { isValidObjectIds } = require("../validator/validation")


const createCart=async function(req,res){
    try{ 
        let userId=req.params.userId
        if(!isValidObjectIds(userId)) return res.status(400).send({status:false, message:"Invalid User Id"})
        let findUser = await userModel.findById(userId)
        if(!findUser) return res.status(404).send({status:false, message:"User not found"})

        if(req.token.userId!==userId) return res.status(403).send({status:false, message:"Unauthorized User"})

        let data=req.body
        let { cartId, productId,  quantity}=data
        if(Object.keys(data).length==0) return res.status(400).send({status:false, message:"No data given for creation"})

        if(!productId) return res.status(400).send({status:false, message:"Product Id is mandatory"})
        if(!isValid(productId)) return res.status(400).send({status:false, message:"Product Id can't be empty"})
        if(!isValidObjectIds(productId)) return res.status(400).send({status:false, message:"Invalid Product Id"})

        if(cartId){
            if(!isValid(cartId)) return res.status(400).send({status:false, message:"Cart Id can't be empty"})
            if(!isValidObjectIds(cartId)) return res.status(400).send({status:false, message:"Invalid Cart Id"})
        }
        // if(quantity){
        //     if(quantity==0) return res.status(400).send({status:false ,message:"Quantity should be greater than 0"})
        //     if(typeof quantity!=='number') return res.status(400).send({status:false, message:"Invalid quantity"})
        // }

        if(!quantity){
           if(quantity==0) return res.status(400).send({status:false ,message:"Quantity should be greater than 0"})
            quantity=1
        }
        if(typeof quantity!=='number') return res.status(400).send({status:false, message:"Invalid quantity"})

        let product = await productModel.findById(productId)
        if(!product || product.isDeleted==true) return res.status(404).send({status:false, message:"Product not found"})

        if(cartId){
            const findCart = await cartModel.findById(cartId).populate([{path:'items.productId'}])
            if(!findCart) return res.status(404).send({status:false, message:"Cart not found"})
            // console.log(findCart.userId.toString())
            // console.log(userId)
            if(findCart.userId.toString()!==userId) return res.status(403).send({status:false, message:"Unauthorized User"})

            let itemsArray = findCart.items
            let totalPrice = findCart.totalPrice
            let totalItems = findCart.totalItems
            let newProduct =true

            for (let i = 0; i < itemsArray.length; i++) {
                // console.log(productId)
                // console.log(itemsArray[i].productId._id.toString())
                if(itemsArray[i].productId._id.toString() == productId){     //product already exists in the cart
                    itemsArray[i].quantity +=quantity
                    totalPrice += itemsArray[i].productId.price * quantity
                    newProduct = false
                }                
            }
            if(newProduct==true){                                    //product does not exist in the cart
                itemsArray.push({productId:productId, quantity:quantity})
                totalPrice += product.price * quantity
            }
            totalPrice=totalPrice.toFixed(2)
            totalItems =itemsArray.length

            const addToCart=await cartModel.findOneAndUpdate({id:cartId},{items:itemsArray , totalPrice:totalPrice, totalItems:totalItems}, {new:true}).select({_v:0})
        
        if(!addToCart) return res.status(404).send({status:false, message:"Cart not found"})
        else return res.status(200).send({status:true, message:"Items added successfully", data:addToCart})
        }

        else{
            let cartData={
                userId :userId,
                items :[{
                    productId:productId,
                    quantity:quantity
                }],
                totalPrice: (product.price *quantity).toFixed(2),
                totalItems:quantity
            }
            
            const findCart=await cartModel.findOne({userId})
            if(findCart) return res.status(400).send({status:false, message:"Cart already exists"})

            const createCart = await cartModel.create(cartData)
            return res.status(201).send({status:true, message:"Cart created successfully", data:createCart})
        }

    }
    catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

module.exports.createCart=createCart
