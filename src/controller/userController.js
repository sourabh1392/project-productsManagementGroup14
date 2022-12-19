const userModel=require("../model/userModel")


const login = async function(req,res){
    try{
        const email=req.body.email
        const password=req.body.password
        const check = await userModel.findOne({email:email,password:password})
        if(!check)
        res.status(400).send({status:false,message:"Login credentials not matched. Please provide correct login credentials"})
        const create= jwt.sign({userId:check._id.toString(),password:password},"Secret key",{expiresIn:"5hr"})
        return res.status(201).send({status:true,message:"Token generated",data:create})
    }
    catch(err){ 
        res.status(500).send({status:false,message:error.message})
    }
}

module.exports.login=login