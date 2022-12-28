const productModel = require("../model/productModel")
const { uploadFile } = require("../aws")
const { isValid, isValidProductSize, isValidObjectIds } = require('../validator/validation')
const moment = require('moment')


//=======================================Create Product===========================================================
const createProduct = async (req, res) => {
    try {
        let data = req.body
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, isDeleted } = data
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ Status: false, message: "Please enter data to create product" })
        }

        //title
        if (!title) {
            return res.status(400).send({ status: false, message: "Please enter Title" })
        }
        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "Please enter valid title" })
        }
        let titleInLowerCase= title.toLowerCase()
        data.title = titleInLowerCase
        let uniqueTitle = await productModel.findOne({title:titleInLowerCase})
        if (uniqueTitle) {
            return res.status(400).send({ status: false, message: "Title already exists" })
        }

        //description
        if (!description) {
            return res.status(400).send({ status: false, message: "Please enter description" })
        }
        if (!isValid(description)) {
            return res.status(400).send({ status: false, message: "Please enter valid description" })
        }

        //price
        if (!price || price == 0) {
            return res.status(400).send({ status: false, message: "Please enter price and it should be greater than 0" })
        }
        if (!Number(price)) return res.status(400).send({ status: false, message: "Price should be a valid number format" })
        data.price = Number(price).toFixed(2)

        //currencyId    
        if (!currencyId) {
            return res.status(400).send({ status: false, message: "Please enter currencyId" })
        }
        if (currencyId !== "INR") {
            return res.status(400).send({ status: false, message: "Currency must be in INR" })
        }

        //currencyFormat
        if (!currencyFormat) {
            return res.status(400).send({ status: false, message: "Please enter currencyFormat" })
        }
        if (currencyFormat !== "₹") {
            return res.status(400).send({ status: false, message: "currency format must be Indian" })
        }


        let files = req.files
        if (!(files && files.length)) {
            return res.status(400).send({ status: false, message: "Please Provide The Profile Image" });
        }
        const uploadProductImage = await uploadFile(files[0])
        data.productImage = uploadProductImage

        //isFreeShipping
        if (isFreeShipping) {
            if (!(isFreeShipping == "true" || isFreeShipping == "false")) return res.status(400).send({ status: false, message: "isFreeShipping should be either true or false" })
        }

        //availableSizes
        if (availableSizes) {
            if (availableSizes.includes(',')) return res.status(400).send({ status: false, message: "Please separate the available sizes with space" })
            availableSizes = availableSizes.toUpperCase()
            let size = availableSizes.split(" ")
            for (let i = 0; i < size.length; i++) {
                if (!isValidProductSize(size[i])) return res.status(400).send({ status: false, message: "Please enter valid size" })
            }
            data.availableSizes = size
        }

        //installments
        if (installments) {
            if (!Number(installments)) return res.status(400).send({ status: false, message: "Installments should be in a valid number format" })
        }

        let productCreated = await productModel.create(data)
        return res.status(201).send({ status: true, message: "Success", data: productCreated })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//==================================Get Products by Filter====================================================

const getProducts = async function (req, res) {
    try {
        let data = req.query
        let { size, name, priceGreaterThan, priceLessThan, priceSort } = data
        let obj = {}
        if (size) {
            size = size.toUpperCase()
            if (!isValidProductSize(size)) return res.status(400).send({ status: false, message: "Please enter valid size" })
            obj["availableSizes"] = { $in: size }
        }
        
        if (name) {
            name= name.toLowerCase()
            obj["title"] = { $regex: name }
        }
        if (priceGreaterThan) {
            obj["price"] = { $gt: priceGreaterThan }
        }
        if (priceLessThan) {
            obj["price"] = { $lt: priceLessThan }
        }
        if (priceGreaterThan && priceLessThan) {
            obj["price"] = { $gt: priceGreaterThan, $lt: priceLessThan }
        }
        obj["isDeleted"]={$eq:false}
        let findProducts = await productModel.find(obj).select({__v:0})

        if (!priceSort) priceSort = 1

        if (priceSort == 1) {
            findProducts.sort((a, b) => a.price - b.price)
        }
        else if (priceSort == -1) {
            findProducts.sort((a, b) => b.price - a.price)
        }
        else return res.status(400).send({ status: false, message: "priceSort can be 1 or -1 only" })
        if (findProducts.length == 0) return res.status(404).send({ status: false, message: "Product not found" })
        return res.status(200).send({ status: true, message: "Success", data: findProducts })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//=======================================Get Product By Id=====================================================

const getProductById = async function (req, res) {
    try {
        const productId = req.params.productId
        if (!isValidObjectIds(productId)) return res.status(400).send({ status: false, message: "Invalid Product Id" })
        const findProduct = await productModel.findById(productId)
        if (!findProduct || findProduct.isDeleted == true) return res.status(404).send({ status: false, message: "Product not found" })
        return res.status(200).send({ status: true, message: "Success", data: findProduct })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//=======================================update product =====================================================

const updateProduct = async function (req, res) {
    try {
        let productId = req.params.productId
        if (!isValidObjectIds(productId)) return res.status(400).send({ status: false, message: "enter valid productId" })
        let finddoc = await productModel.findById(productId)
        if (!finddoc) return res.status(404).send({ status: false, message: "product not found" })
        if(finddoc.isDeleted==true) return res.status(400).send({status:false, message:"product is not present"})
        let data = req.body
        let { title, description, price, currencyId, productImage, currencyFormat, isFreeShipping, style, availableSizes, installments, isDeleted } = data
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "enter the data for updation" })
        if (title) {
            if (!title) {
                return res.status(400).send({ status: false, message: "Please enter Title" })
            }
            if (!isValid(title)) {
                return res.status(400).send({ status: false, message: "Please enter valid title" })
            }
            let titleInLowerCase= title.toLowerCase()
            data.title = titleInLowerCase
            let uniqueTitle = await productModel.findOne({title:titleInLowerCase})
            if (uniqueTitle) {
                return res.status(400).send({ status: false, message: "Title already exists" })
        }
    }
        if (description) {
            if (!description) {
                return res.status(400).send({ status: false, message: "Please enter description" })
            }
            if (!isValid(description)) {
                return res.status(400).send({ status: false, message: "Please enter valid description" })
            }
        }
        if (price) {
            if (!price || price == 0) {
                return res.status(400).send({ status: false, message: "Please enter price" })
            }
            if (!Number(price)) return res.status(400).send({ status: false, message: "Price should be a valid number format" })
            data.price = Number(price).toFixed(2)
        }

        if (currencyId) {
            if (!currencyId) {
                return res.status(400).send({ status: false, message: "Please enter currencyId" })
            }
            if (currencyId !== "INR") {
                return res.status(400).send({ status: false, message: "Currency must be in INR" })
            }
        }

        if (currencyFormat) {
            if (!currencyFormat) {
                return res.status(400).send({ status: false, message: "Please enter currencyFormat" })
            }
            if (currencyFormat !== "₹") {
                return res.status(400).send({ status: false, message: "currency format must be ₹" })
            }
        }
        if (productImage) {
            let files = req.files
            if (!(files && files.length)) {
                return res.status(400).send({ status: false, message: "Please Provide The Profile Image" });
            }
            const uploadProductImage = await uploadFile(files[0])
            data.productImage = uploadProductImage
        }

        if (isFreeShipping) {
            if (!(isFreeShipping == "true" || isFreeShipping == "false")) return res.status(400).send({ status: false, message: "isFreeShipping should be either true or false" })
        }

        if (availableSizes) {
            if (availableSizes.includes(',')) return res.status(400).send({ status: false, message: "Please separate the available sizes with space" })
            availableSizes = availableSizes.toUpperCase()
            let size = availableSizes.split(" ")
            for (let i = 0; i < size.length; i++) {
                if (!isValidProductSize(size[i])) return res.status(400).send({ status: false, message: "Please enter valid size" })

            }
            data.availableSizes = size
        }

        //installments
        if (installments) {
            if (!Number(installments)) return res.status(400).send({ status: false, message: "Installments should be in a valid number format" })
        }

        let updateData = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { $set: data }, { new: true })
        if (!updateData) return res.status(400).send({ status: false, message: "data not updated" })
        return res.status(200).send({ status: true, message: "Success", data: updateData })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//=======================================delete product =====================================================

const deleteProduct = async function (req, res) {
    try {
        const productId = req.params.productId
        if (!isValidObjectIds(productId)) {
            return res.status(400).send({ status: false, message: "Invalid Product Id" })
        }
        const findProduct = await productModel.findById(productId)
        if (!findProduct || findProduct.isDeleted == true) {
            return res.status(404).send({ status: false, message: "product document is not found" })
        }
        
        let deletedata = await productModel.findOneAndUpdate({ _id: productId }, { isDeleted: true, deletedAt: moment().format() }, { new: true }).select({__v:0})
        if (!deletedata) return res.status(400).send({ status: false, message: "product is not deleted" })
        return res.status(200).send({ status: true, message: "Success", data: deletedata })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct }