const express=require("express")
const router=express.Router()
const {authenticate, authorize }=require("../middleware/auth")
const {createUser, login, getUser, updateUser }=require("../controller/userController")
const {createCart, getCart, deleteCart}=require("../controller/cartController")
const orderController=require("../controller/orderController")
const {createProduct, getProducts, getProductById, updateProduct , deleteProduct }=require("../controller/productController")

//user
router.post("/register", createUser)
router.post('/login', login)
router.get("/user/:userId/profile", authenticate , getUser)
router.put("/user/:userId/profile", authenticate, authorize , updateUser ) 

//product
router.post("/products", createProduct)
router.get("/products", getProducts)
router.get("/products/:productId", getProductById)
router.put("/products/:productId", updateProduct )
router.delete("/products/:productId", deleteProduct)

//cart
router.post("/users/:userId/cart", authenticate, createCart)
router.get("/users/:userId/cart", getCart )
router.delete("/users/:userId/cart", deleteCart )

router.all("/*", function (req, res) {
try{
    res.status(404).send({status: false,msg: "The api you request is not available"})

}catch(err){res.send(err.message)}})

module.exports=router