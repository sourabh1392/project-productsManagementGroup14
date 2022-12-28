const orderModel = require("../model/orderModel")
const cartModel = require("../model/cartModel")
const userModel = require("../model/userModel")
const { isValidObjectIds, isValidStatus } = require('../validator/validation')

//====================================CREATE ORDER========================================================

const createOrder = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!isValidObjectIds(userId)) return res.status(400).send({ status: false, message: "Invalid User Id" })
        let userData = await userModel.findById(userId)
        if (!userData) {
            return res.status(404).send({ status: false, message: "User Not Found" })
        }
        let cartId = req.body.cartId
        let status = req.body.status
        if (!cartId) return res.status(400).send({ status: false, message: "Enter cartId" })
        const cart = await cartModel.findById(cartId).populate({ path: 'items.productId' }).lean()
        if (!cart) return res.status(404).send({ status: false, message: "Cart Not Found" })
        if (req.token.userId != cart.userId.toString()) return res.status(403).send({ status: false, message: "Unauthorised User" })
        if (cart.items.length == 0) return res.status(404).send({ status: false, message: "Cart is empty. Please add Product to Cart." })
        delete cart["_id"]
        let quantity = 0;
        for (let i = 0; i < cart.items.length; i++) {
            quantity += cart.items[i].quantity
        }
        cart.totalQuantity = quantity
        if (status) {
            if (!isValidStatus(status)) return res.status(400).send({ status: false, message: "invalid status" })
        }
        let order = await orderModel.create(cart)
        if (order) {
            let cartUpdate = await cartModel.findOneAndUpdate({ _id: cartId }, { totalPrice: 0, totalItems: 0, items: [] }, { new: true })
        }
        return res.status(201).send({ status: true, message: "Success", data: order })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//====================================CANCEL ORDER(UPDATE)=======================================================

const updateOrder = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!isValidObjectIds(userId)) return res.status(400).send({ status: false, message: "Invalid User Id" })
        let userData = await userModel.findById(userId)
        if (!userData) {
            return res.status(404).send({ status: false, message: "User Not Found" })
        }

        let data = req.body
        let { orderId, status } = data
        if (!orderId) return res.status(400).send({ status: false, message: "Please provide Order Id" })
        if (!isValidObjectIds((orderId))) return res.status(400).send({ status: false, message: "Invalid Order Id" })
        let findOrder = await orderModel.findOne({ _id: orderId, isDeleted: false })
        if (!findOrder) return res.status(404).send({ status: false, message: "Order not found" })
        let findCart = await cartModel.findOne({ userId: userId })
        if (!findCart) return res.status(404).send({ status: false, message: "cart does not exist" })

        if (req.token.userId !== findOrder.userId.toString()) return res.status(403).send({ status: false, message: "Unauthorised User" })

        if (findOrder.status == "completed") return res.status(400).send({ status: false, message: "Status cannot be updated because it is already set to completed" })

        if (findOrder.status == "cancelled") return res.status(400).send({ status: false, message: "Status cannot be updated because it is already set to cancelled" })

        if (!status) return res.status(400).send({ status: false, message: "please provide status to update " })
        if (!isValidStatus(status)) return res.status(400).send({ status: false, message: "invalid status" })

        if (status === "cancelled") {
            if (findOrder.cancellable == false) return res.status(400).send({ status: false, message: "this order cannot be cancelled" })
            else findOrder.status = "cancelled"
        } else if (status === "completed") {
            findOrder.status = "completed"
        } else {
            return res.status(400).send({ status: false, message: "the status could either be cancelled or completed!" })
        }

        findOrder.save()
        return res.status(200).send({ status: true, message: 'Success', data: findOrder })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}
module.exports = { createOrder, updateOrder }