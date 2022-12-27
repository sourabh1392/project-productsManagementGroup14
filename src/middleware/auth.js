const jwt = require('jsonwebtoken');
const userModel = require('../model/userModel');
const { isValidObjectIds } = require('../validator/validation');

const authenticate = function(req, res, next) {
    try {
        let bearerHeader= req.headers['authorization'];
        if (!bearerHeader) return res.status(400).send({ status: false, message: "token must be present" });
        const bearer= bearerHeader.split(' ')
        const bearerToken= bearer[1]
        jwt.verify(bearerToken, "Secret key", function (err, decodedToken) {
            if(err){
            if(err.message=="jwt expired") {
                return res.status(400).send({status:false, message:"session expired! login again"})
            }
             return res.status(401).send({ status: false, message: "Invalid token" }) 
        }
            req.token= decodedToken;
            next();
        })
    } catch (error) {
         return res.status(500).send({ status: false, message: error.message });

    }
}

const authorize = async function(req,res,next){
    try{
      let userId= req.params.userId
      if(!userId) return res.status(400).send({status:false, message:"Enter the userid"})
      if(!isValidObjectIds(userId)) return res.status(400).send({status:false, message:"Enter valid userid"})
      let findUser= await userModel.findById(userId)
      if(!findUser) return res.status(404).send({status:false, message:"user not found"})
     let tokenToBeCheck= req.token.userId
      if(userId!=tokenToBeCheck)
      return res.status(403).send({status:false, message:"access denied! ,user is not authorized"})
      next()
    }
    catch(err){
        return res.status(500).send({ status: false, message: err.message});
    }
}

module.exports = {authenticate, authorize};