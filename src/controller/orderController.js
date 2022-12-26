const orderModel = require("../model/orderModel")
const cartModel = require("../model/cartModel")
const { isValidObjectIds } = require('../validator/validation')

//====================================CREATE ORDER========================================================

const createOrder = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!userId) return res.status(400).send({ status: false, message: "Please provide userId" })
        if (!isValidObjectIds(userId)) return res.status(400).send({ status: false, message: "Invalid User Id" })
        const cart = await cartModel.findOne({ userId: userId })
        if (!cart) return res.status(404).send({ status: false, message: "Cart Not Found" })
        if (cart.items.length == 0) return res.status(404).send({ status: false, message: "Cart is empty. Please add Product to Cart." })

    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//====================================CANCEL ORDER(UPDATE)========================================================

const cancelOrder = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!userId) return res.status(400).send({ status: false, message: "Please provide userId" })
        if (!isValidObjectIds(userId)) return res.status(400).send({ status: false, message: "Invalid User Id" })
        const orders = await orderModel.find({ userId: userId, isDeleted: false })
        if (!orders) return res.status(400).send({ status: false, message: "You dont have any order" })
        return res.status(200).send({ status: true, message: 'Success', data: orders })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { createOrder, cancelOrder }