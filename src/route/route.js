const express=require("express")
const router=express.Router()
const {authenticate, authorize }=require("../middleware/auth")
const {createUser, login, getUser, updateUser }=require("../controller/userController")
const {createCart, updateCart} =require("../controller/cartController")
const {createProduct, getProducts, getProductById, updateProduct , deleteProduct }=require("../controller/productController")

//=======================================User APIs========================================================
router.post("/register", createUser)
router.post('/login', login)
router.get("/user/:userId/profile", authenticate , getUser)
router.put("/user/:userId/profile", authenticate, authorize , updateUser ) 

//=======================================Product APIs======================================================
router.post("/products", createProduct)
router.get("/products", getProducts)
router.get("/products/:productId", getProductById)
router.put("/products/:productId", updateProduct )
router.delete("/products/:productId", deleteProduct)

//=======================================Cart APIs==========================================================
router.post("/users/:userId/cart", authenticate, authorize, createCart)
router.put("/users/:userId/cart", authenticate,authorize, updateCart)


router.all("/*", function (req, res) {
try{
    res.status(404).send({status: false,msg: "The api you request is not available"})

}catch(err){res.send(err.message)}})

module.exports=router