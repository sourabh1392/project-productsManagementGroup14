const productModel=require("../model/productModel")
const {isValidObjectIds }= require("../validator/validatior")
const productModel = require("../model/productModel")
const { uploadFile } = require("../aws")
const { isValid } = require('../validator/validation')


const createProduct = async (req, res) => {
    try {
        let data = req.body
        // data=JSON.parse(data)
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, deletedAt, isDeleted } = data
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ Status: false, message: "Please enter data to create product" })
        }
        if (!title) {
            return res.status(400).send({ status: false, message: "Please enter Title" })
        }
        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "Please enter valid title" })
        }
        let uniqueTitle = await productModel.findOne({ title })
        if (uniqueTitle) {
            return res.status(400).send({ Status: false, message: "Title entered is already exist" })
        }
        if (!description) {
            return res.status(400).send({ status: false, message: "Please enter description" })
        }
        if (!isValid(description)) {
            return res.status(400).send({ status: false, message: "Please enter valid description" })
        }

        if (!price) {
            return res.status(400).send({ status: false, message: "Please enter price" })
        }
        // console.log(price)

        data.price=Number(price).toFixed(2)
        // Number(data.price)
        if (!isValid(price)) {
            return res.status(400).send({ status: false, message: "Please enter valid price" })}

        if (!currencyId) {
            return res.status(400).send({ status: false, message: "Please enter currencyId" })
        }
        if (!isValid(currencyId)) {
            return res.status(400).send({ status: false, message: "Please enter valid currencyId" })
        }
        if (currencyId !== "INR") {
            return res.status(400).send({ Status: false, message: "Currency must be in INR" })
        }

        if (!currencyFormat) {
            return res.status(400).send({ status: false, message: "Please enter currencyFormat" })
        }
        if (!isValid(currencyFormat)) {
            return res.status(400).send({ status: false, message: "Please enter valid currencyFormat" })
        }
        if (currencyFormat !== "₹") {
            return res.status(400).send({ Status: false, message: "currency format must be Indian" })
        }

        let files = req.files
        if (!(files && files.length)) {
            return res.status(400).send({ status: false, message: "Please Provide The Profile Image" });
        }

        const uploadProductImage = await uploadFile(files[0])
        data.productImage = uploadProductImage

        if (availableSizes){
            let arr = Object.keys(availableSizes)
    
            if (arr.length == 0) { return res.status(400).send({ status: false, message: "Please enter data to update" }) }
            for (let i = 0; i < arr.length; i++) {
                let msg = ["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(arr[i])
                if (msg == -1) {
                    return res.status(400).send({ status: false, message: "Please enter valid size" })
                }
            }}

        let create = await productModel.create(data)
        return res.status(201).send({ status: true, message: "Product Created", data: create })

    }
    catch (err) {
        return res.status(400).send({ Status: false, message: err.message })
    }


}





const getProducts = async function (req, res) {
    try {
        let data = req.query
        let { size, name,priceGreaterThan,priceLessThan } = data
        // data.availableSizes=size,
        // data.title=name
        // data.price=price
        let obj={}
        if(name){
            obj["title"]={$eq:name}
        }
        if(size){
            obj["availableSizes"]={$in:size}
        }
        if(priceGreaterThan){
            obj["price"]={$gte:priceGreaterThan}
        }
        if(priceLessThan){
            obj["price"]={$lte:priceLessThan}
         }
         if(priceGreaterThan && priceLessThan)
         {
            obj["price"]={$gte:priceGreaterThan, $lte:priceLessThan}
         }
        
        let getData = await productModel.find(obj)
        if(getData.length==0) return res.status(404).send({status:false, message:"product not found"})

        return res.status(200).send({ status: true, data: getData })

    }
    catch (err) {
        return res.status(500).send({ Status: false, message: err.message })
    }
}

module.exports = { getProducts, createProduct }
