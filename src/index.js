const express=require("express")
const mongoose=require("mongoose")
const app=express()
const multer =require('multer')
const route=require("./route/route")

mongoose.set('strictQuery', false)

app.use(express.json())

app.use(multer().any())

mongoose.connect("mongodb+srv://Project5:Project5@productmanagementcluste.3t2znay.mongodb.net/group14Database",
{ useNewUrlParser:true})
.then(()=>{console.log("MongoDB is connected")})
.catch(err=>console.log(err))

app.use("/",route)

app.listen(3000,()=>{
    console.log("Express app running on port 3000")
})