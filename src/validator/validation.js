const {isValidObjectId} = require("mongoose")

const validName=function(name){
    const nameRegex=/^[ a-z ]+$/i
    return nameRegex.test(name)
}

const isValid=function(value){
    if( typeof value=='undefined' || value==null) return false
    if( typeof value=='string' && value.trim().length===0) return false
    return true
}

const validPhone=function(phone){
   const phoneRegex=/^[6789]\d{9}$/
   return phoneRegex.test(phone)
}

const validEmail=function(email){
   const emailRegex=/^[\w-\.]+@([\w-]+\.)+[\w-][a-z]{1,4}$/
   return emailRegex.test(email)
}
const isValidPassword=function(password){
    password = password.trim()
   const passRegex= /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/
   return passRegex.test(password)
}

const isValidPincode=function(pincode){
   const pincoderegex= /^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/
   return pincoderegex.test(pincode)
}

const  isValidObjectIds =function(id){
    const check = isValidObjectId(id);
    return check
}

const validImage=function(image){
    const urlreg = /^https?:\/\/(.+\/)+.+(\.(gif|png|jpg|jpeg|webp|svg|psd|bmp|tif))$/i
    return urlreg.test(image)
}

const isValidProductSize=function(size){ 
    const enumArr=["S", "XS", "M", "X", "L", "XXL", "XL"]
    if(enumArr.indexOf(size)==-1) return false
    else return true
}
const isValidStatus = function (status) {
    const statusArr=['pending', 'completed', 'cancelled']
    if(statusArr.indexOf(status) == -1) return false
    else return true
}


module.exports={validName,isValid,validPhone,validEmail,isValidPincode,isValidPassword,isValidObjectIds,validImage,isValidProductSize,isValidStatus}