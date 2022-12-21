const express=require("express")
const router=express.Router()
const auth=require("../middleware/auth")
const userController=require("../controller/userController")
const cartController=require("../controller/cartController")
const orderController=require("../controller/orderController")
const productController=require("../controller/productController")



router.post("/register", userController.createUser)
router.post('/login', userController.login)
router.get("/user/:userId/profile",auth.authenticate , userController.getUser)
router.put("/user/:userId/profile", auth.authenticate,auth.authorize ,userController.updateUser)

router.post("/products",productController.createProduct)
router.get("/products",productController.getProducts)
router.get("/products/:productId", productController.getProductById)
router.put("/products/:productId", productController.updateProduct )
router.delete("/products/:productId", productController.deleteProduct)

router.all("/*", function (req, res) {
try{
    res.status(404).send({status: false,msg: "The api you request is not available"})

}catch(err){res.send(err.message)}})

module.exports=router