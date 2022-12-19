const express=require("express")
const mongoose=require("mongoose")
const app=express()
const route=require("./route/route")

mongoose.set("strictQuery",true)

app.use(express.json())

mongoose.connect(" ",{

})
.then(()=>{console.log("MongoDB is connected")})
.catch(err=>console.log(err))

app.use("/",route)

app.listen(3000,()=>{
    console.log("Express app running on port 3000")
})