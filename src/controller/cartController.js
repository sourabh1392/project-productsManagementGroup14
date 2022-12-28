const cartModel = require("../model/cartModel")
const productModel = require('../model/productModel')
const userModel = require('../model/userModel')
const { isValid, isValidObjectIds } = require('../validator/validation')

//========================================= CREATE CART =========================================================

const createCart = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!isValidObjectIds(userId)) return res.status(400).send({ status: false, message: "Invalid User Id" })
        let findUser = await userModel.findById(userId)
        if (!findUser) return res.status(404).send({ status: false, message: "User not found" })

        let data = req.body
        let { cartId, productId, quantity } = data
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "No data given for creation" })

        if (!productId) return res.status(400).send({ status: false, message: "Product Id is mandatory" })
        if (!isValid(productId)) return res.status(400).send({ status: false, message: "Product Id can't be empty" })
        if (!isValidObjectIds(productId)) return res.status(400).send({ status: false, message: "Invalid Product Id" })

        if (cartId) {
            if (!isValid(cartId)) return res.status(400).send({ status: false, message: "Cart Id can't be empty" })
            if (!isValidObjectIds(cartId)) return res.status(400).send({ status: false, message: "Invalid Cart Id" })
        }

        if (!quantity) {
            if (quantity == 0) return res.status(400).send({ status: false, message: "Quantity should be greater than 0" })
            quantity = 1
        }
        if (typeof quantity !== 'number') return res.status(400).send({ status: false, message: "Invalid quantity" })

        let product = await productModel.findById(productId)
        if (!product || product.isDeleted == true) return res.status(404).send({ status: false, message: "Product not found" })

        if (cartId) {
            const findCart = await cartModel.findById(cartId).populate([{ path: 'items.productId' }])
            if (!findCart) return res.status(404).send({ status: false, message: "Cart not found" })
            if (findCart.userId.toString() !== userId) return res.status(403).send({ status: false, message: "Unauthorized User" })

            let itemsArray = findCart.items
            let totalPrice = findCart.totalPrice
            let totalItems = findCart.totalItems
            let newProduct = true

            for (let i = 0; i < itemsArray.length; i++) {
                if (itemsArray[i].productId._id.toString() == productId) {     //product already exists in the cart
                    itemsArray[i].quantity += quantity
                    totalPrice += itemsArray[i].productId.price * quantity
                    newProduct = false
                }
            }
            if (newProduct == true) {                                    //product does not exist in the cart
                itemsArray.push({ productId: productId, quantity: quantity })
                totalPrice += product.price * quantity
            }
            totalPrice = totalPrice.toFixed(2)
            totalItems = itemsArray.length

            const addToCart = await cartModel.findOneAndUpdate({ _id: cartId }, { items: itemsArray, totalPrice: totalPrice, totalItems: totalItems }, { new: true }).select({ __v: 0 })

            if (!addToCart) return res.status(404).send({ status: false, message: "Cart not found" })
            else return res.status(200).send({ status: true, message: "Success", data: addToCart })
        }

        else {
            let cartData = {
                userId: userId,
                items: [{
                    productId: productId,
                    quantity: quantity
                }],
                totalPrice: (product.price * quantity).toFixed(2),
                totalItems: quantity
            }

            const findCart = await cartModel.findOne({userId})
            if (findCart) return res.status(400).send({ status: false, message: "Cart already exists for this user so enter cartId" })

            const createCart = await cartModel.create(cartData)
            return res.status(201).send({ status: true, message: "Success", data: createCart })
        }

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//======================================= UPDATE CART ====================================================

const updateCart = async function (req, res) {
    try {
        const userId = req.params.userId
        if (!isValidObjectIds(userId)) return res.status(400).send({ status: false, message: "Invalid User Id" })
        const findUser = await userModel.findById(userId)
        if (!findUser) return res.status(404).send({ status: false, message: "User not found" })

        let data = req.body
        let { productId, cartId, removeProduct } = data

        if (!productId) return res.status(400).send({ status: false, message: "Product Id is mandatory" })
        if (!isValid(productId)) return res.status(400).send({ status: false, message: "Product Id can't be empty" })
        if (!isValidObjectIds(productId)) return res.status(400).send({ status: false, message: "Invalid Product Id" })

        if (!cartId) return res.status(400).send({ status: false, message: "Cart Id is mandatory" })
        if (!isValid(cartId)) return res.status(400).send({ status: false, message: "Cart Id can't be empty" })
        if (!isValidObjectIds(cartId)) return res.status(400).send({ status: false, message: "Invalid Cart Id" })

        if (!(removeProduct == 0 || removeProduct == 1)) return res.status(400).send({ status: false, message: "Set removeProduct to 0 to remove the product from the cart or 1 to decrement it's quantity by 1 " })

        const findProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!findProduct) return res.status(404).send({ status: false, message: "Product not found" })

        const findCart = await cartModel.findById(cartId).populate([{ path: 'items.productId' }])
        if (!findCart) return res.status(404).send({ status: false, message: "Cart not found" })
        if (findCart.userId.toString() !== userId) return res.status(403).send({ status: false, message: "Unauthorized User" })
        let itemsArray = findCart.items
        let initialItems = itemsArray.length
        let totalPrice = findCart.totalPrice
        let totalItems = findCart.totalItems

        if (removeProduct === 0) {
            for (let i = 0; i < itemsArray.length; i++) {
                if (itemsArray[i].productId._id.toString() == productId) {
                    totalPrice -= itemsArray[i].productId.price * itemsArray[i].quantity
                    totalItems--
                    itemsArray.splice(i, 1)
                }
            }

            if (initialItems === totalItems) return res.status(404).send({ status: false, message: "Product not found in the cart" })
        }

        if (removeProduct === 1) {
            let product = false
            for (let i = 0; i < itemsArray.length; i++) {
                if (itemsArray[i].productId._id.toString() == productId) {
                    product = true
                    totalPrice -= itemsArray[i].productId.price
                    itemsArray[i].quantity--
                    if (itemsArray[i].quantity == 0) {
                        totalItems--
                        itemsArray.splice(i, 1)
                    }
                }
            }
            if (!product) return res.status(404).send({ status: false, message: "Product not found in the Cart" })
        }

        totalPrice = totalPrice.toFixed(2)

        const removeProductFromCart = await cartModel.findOneAndUpdate({ _id: cartId }, { items: itemsArray, totalPrice: totalPrice, totalItems: totalItems }, { new: true }).select({ __v: 0 })

        if (!removeProductFromCart) return res.status(404).send({ status: false, message: "Cart not found" })
        return res.status(200).send({ status: true, message: "Removed", data: removeProductFromCart })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//======================================= GET CART DETAILS ================================================

const getCart = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!isValidObjectIds(userId)) return res.status(400).send({ status: false, message: "Invalid User Id" })
        let userData=await userModel.findById(userId)
        if(!userData){
            return res.status(404).send({status:false,message:"User Not Found"})
        }
        let cartData = await cartModel.findOne({ userId: userId }).populate({path:'items',
              populate:{
              path:'productId',
              model:'Product',
              select:{ title:1, productImage:1, style:1, price:1, _id:0},
              },
             })
        if (!cartData) return res.status(404).send({ status: false, message: "Cart Not Found" })
        if (cartData.totalItems == 0) return res.status(404).send({ status: false, message: "Cart is Empty" })
        return res.status(200).send({ status: true, message: 'Success', data: cartData })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
//======================================= DELETE CART ====================================================

const deleteCart=async function(req,res){
    try{
        let userId = req.params.userId
        if (!isValidObjectIds(userId)) return res.status(400).send({ status: false, message: "Invalid User Id" })
        let userData=await userModel.findById(userId)
        if(!userData){
            return res.status(404).send({status:false,message:"User Not Found"})
        }
        let cartData = await cartModel.findOne({ userId: userId })
        if (!cartData) return res.status(404).send({ status: false, message: "Cart Not Found" })
        if (cartData.totalItems == 0 &&cartData.totalPrice==0 &&cartData.items.length==0) return res.status(400).send({ status: false, message: "Cart Already Deleted" })
        const deleteCart = await cartModel.findByIdAndUpdate(cartData._id, { items: [], totalPrice: 0, totalItems: 0 }, { new: true })
        if(!deleteCart){
            return res.status(400).send({status:false,message:"Cart already deleted"})
        }
        return res.status(204).send({ status: true, message: "Success", data: deleteCart })
    }
    catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}

module.exports = { createCart, updateCart ,getCart ,deleteCart}
