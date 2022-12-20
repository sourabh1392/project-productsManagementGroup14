const jwt = require('jsonwebtoken');
const { isValidObjectIds } = require('../validator/validation');

const authenticate = function(req, res, next) {
    try {
        let bearerHeader= req.headers['authorization'];
        if (!bearerHeader) return res.status(400).send({ status: false, msg: "token must be present" });
        const bearer= bearerHeader.split(' ')
        const bearerToken= bearer[1]
        jwt.verify(bearerToken, "Secret key", function (err, decodedToken) {
            if(err && err.message=="jwt expired") return res.status(400).send({status:false, message:"session expired! login again"})
            if (err) { return res.status(401).send({ status: false, data: "invalid token" }) }
            req.token= decodedToken;
            next();
        })
    } catch (error) {
         return res.status(500).send({ status: false, msg: error });

    }
}

const authorize = function(req,res,next){
    try{
      let userId= req.params.userId
      if(!userId) return res.status(400).send({status:false, message:"Enter the userid"})
      if(!isValidObjectIds(userId)) return res.status(400).send({status:false, message:"Enter valid userid"})
     let tokenToBeCheck= req.token.userId
      if(userId!=tokenToBeCheck)
      return res.status(403).send({status:false, message:"access denied! ,user is not authorized"})
      next()
    }
    catch(err){
        return res.status(500).send({ status: false, msg: error });
    }

}


module.exports = {authenticate, authorize};