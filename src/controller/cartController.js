// const cartModel=require("../model/cartModel")
// const userModel= require("../model/userModel")
// const {isValidObjectIds }= require("../validator/validation")

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