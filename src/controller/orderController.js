const orderModel = require("../model/orderModel")
const cartModel = require("../model/cartModel")
const userModel=require("../model/userModel")
const { isValidObjectIds } = require('../validator/validation')

//====================================CREATE ORDER========================================================

const createOrder = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!isValidObjectIds(userId)) return res.status(400).send({ status: false, message: "Invalid User Id" })
        let userData=await userModel.findById(userId)
        if(!userData){
            return res.status(404).send({status:false,message:"User Not Found"})
        }
        let cartId=req.body.cartId
        if(!cartId) return res.status(400).send({status:false,message:"Enter cartId"})
        const cart = await cartModel.findById(cartId).populate({path:'items.productId'})
        if (!cart) return res.status(404).send({ status: false, message: "Cart Not Found" })
        if (cart.items.length == 0) return res.status(404).send({ status: false, message: "Cart is empty. Please add Product to Cart." })
        let quantity=0;
        for(let i=0;i<cart.items.length;i++){
            quantity+=cart.items[i].quantity
        }
        cart.totalQuantity=quantity
        let order=await orderModel.create(cart)
        return res.status(201).send({status:true,message:"Order Placed",data:order})
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//====================================CANCEL ORDER(UPDATE)========================================================

const cancelOrder = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!isValidObjectIds(userId)) return res.status(400).send({ status: false, message: "Invalid User Id" })
        let userData=await userModel.findById(userId)
        if(!userData){
            return res.status(404).send({status:false,message:"User Not Found"})
        }
        const orders = await orderModel.find({ userId: userId, isDeleted: false })
        if (!orders) return res.status(400).send({ status: false, message: "You dont have any order" })
        return res.status(200).send({ status: true, message: 'Success', data: orders })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { createOrder, cancelOrder }