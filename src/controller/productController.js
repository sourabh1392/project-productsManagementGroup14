const productModel=require("../model/productModel")
const {isValidObjectIds }= require("../validator/validation")
const getProductbyQuery= async function(req,res){
    try{
       let data = req.query
       let {price, name, priceGreatorThan, priceLessThan} = data
       if(!price && !name && !priceGreatorThan && !priceLessThan)
       return res.status(400).send({status:false, message:"enter the filters/query"})
       if(priceGreatorThan && priceLessThan){
       let getdata= await productModel.find({isDeleted:false ,size:availableSizes ,name:title,},{priceSort:1})
        if(!getdata)
        return res.status(404).send({status:false, message })
    }
}

    catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}


const getProduct= async function(req,res){
try{
    let productId= req.params.productId
    if(!productId) return res.status(400).send({status:false, meassge:"enter the productid"})
    if(!isValidObjectIds(productId)) return res.status(400).send({status:false, meassge:"enter valid productid"})
    let getpro=  await productModel.findOne({productId})
    if(!getpro) return res.status(404).send({status:false, message:"no such data found"})
    return res.status(200).send({status:false, data:getpro})
}
catch(err){
    return res.status(500).send({status:false, message:err.message})
}
}
module.exports = { getProduct, getProductbyQuery}
