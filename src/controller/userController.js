const userModel = require("../model/userModel")
const aws = require('aws-sdk')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {uploadFile}=require("../aws")
const { validName, isValid, validPhone, validEmail, isValidPincode, isValidPassword, isValidObjectIds } = require('../validator/validation')

//AWS
// aws.config.update({
//     accessKeyId: "AKIAY3L35MCRZNIRGT6N",
//     secretAccessKey: "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",
//     region: "ap-south-1"
// })

// let uploadFile = async (file) => {
//     return new Promise(function (resolve, reject) {
//         let s3 = new aws.S3({ apiVersion: '2006-03-01' })
//         var uploadParams = {
//             ACL: "public-read",
//             Bucket: "classroom-training-bucket",
//             Key: "abc/" + file.originalname,
//             Body: file.buffer
//         }
//         s3.upload(uploadParams, function (err, data) {
//             if (err) return reject({ error: err })
//             // console.log(data)
//             // console.log("file uploaded successfully")
//             return resolve(data.Location)
//         })
//     })
// }

//=======================================Create User===========================================================
const createUser = async function (req, res) {
    try {
        let data = req.body
        let { fname, lname, email, profileImage, phone, password, address } = data
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "enter the data" })

        //First Name
        if (!isValid(fname)) return res.status(400).send({ status: false, message: "First Name is mandatory" })
        if (!validName(fname)) return res.status(400).send({ status: false, message: "First Name can only take alphabets" })

        //Last Name
        if (!isValid(lname)) return res.status(400).send({ status: false, message: "Last Name is mandatory" })
        if (!validName(lname)) return res.status(400).send({ status: false, message: "Last Name can only take alphabets" })

        //Email
        if (!isValid(email)) return res.status(400).send({ status: false, message: "Enter Email Id" })
        if (!validEmail(email)) return res.status(400).send({ status: false, message: "Invalid Email Id" })
        let emailExist = await userModel.findOne({ email: email })
        if (emailExist) return res.status(400).send({ status: false, message: "Email Id already exists" })

        //Phone
        if (!isValid(phone)) return res.status(400).send({ status: false, message: "Enter Phone No" })
        if (!validPhone(phone)) return res.status(400).send({ status: false, message: "Invalid Phone No" })
        let phoneExist = await userModel.findOne({ phone: phone })
        if (phoneExist) return res.status(400).send({ status: false, message: "Phone No already exists" })

        //Profile Image
        let files = req.files
        if (!(files && files.length)) {
            return res.status(400).send({ status: false, message: "Please Provide The Profile Image" });
        }
        const uploadProfileImage = await uploadFile(files[0])
        data.profileImage = uploadProfileImage

        //Password
        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "Password should be between 8 to 15 characters and should contain atleast one uppercase & lowercase letter,a number and a special character" })
        password = await bcrypt.hash(password, 10)
        data.password = password

        //Address
        address = JSON.parse(address)
        if (address) {
            if (typeof address != "object") return res.status(400).send({ status: false, message: "address is in incorrect format" })

            //Shipping   
            if (address.shipping) {
                if (address.shipping.street) {
                    if (!isValid(address.shipping.street)) return res.status(400).send({ status: false, message: "shipping street is in wrong format" })
                } else return res.status(400).send({ status: false, message: "address.shipping.street is mandatory" })

                if (address.shipping.city) {
                    if (!isValid(address.shipping.city)) return res.status(400).send({ status: false, message: "shipping city is in wrong format" })
                    if (!validName(address.shipping.city)) return res.status(400).send({ status: false, message: "shipping city can only take Alphabets" })
                } else return res.status(400).send({ status: false, message: "shipping city is mandatory" })

                if (address.shipping.pincode) {
                    if (typeof address.shipping.pincode != "number") return res.status(400).send({ status: false, message: "shipping pincode is in wrong format" })
                    if (!isValidPincode(address.shipping.pincode)) return res.status(400).send({ status: false, message: "Pincode should be 6 characters long" })
                } else return res.status(400).send({ status: false, message: "shipping pincode is mandatory" })

            } else return res.status(400).send({ status: false, message: "address shipping is mandatory" })


            //Billing
            if (address.billing) {
                if (address.billing.street) {
                    if (!isValid(address.billing.street)) return res.status(400).send({ status: false, message: "billing street is in wrong format" })
                } else return res.status(400).send({ status: false, message: "billing street is mandatory" })

                if (address.billing.city) {
                    if (!isValid(address.billing.city)) return res.status(400).send({ status: false, message: "billing city is in wrong format" })
                    if (!validName(address.billing.city)) return res.status(400).send({ status: false, message: "shipping city can only take Alphabets" })
                } else return res.status(400).send({ status: false, message: "billing city is mandatory" })


                if (address.billing.pincode) {
                    if (typeof address.billing.pincode != "number") return res.status(400).send({ status: false, message: "billing pincode is in incorrect format" })
                    if (!isValidPincode(address.billing.pincode)) return res.status(400).send({ status: false, message: "Pincode should be 6 characters long" })
                }
                else return res.status(400).send({ status: false, message: "billing pincode is mandatory" })

            } else return res.status(400).send({ status: false, message: "address billing is mandatory" })

        } else return res.status(400).send({ status: false, message: "Address is mandatory" })

        data.address = address

        //Create User
        const createUser = await userModel.create(data)
        return res.status(201).send({ status: true, message: "User created Successfully", data: createUser })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//==========================================Login==============================================================
const login = async function (req, res) {
    try {
        const email = req.body.email
        const password = req.body.password
        const check = await userModel.findOne({ email: email })
        if (!check) return res.status(400).send({ status: false, message: "Please provide correct Email Id" })
        const passCompare = await bcrypt.compare(password, check.password)

        if (!passCompare) return res.status(400).send({ status: false, message: "Please provide correct Password" })
        else {
            const token = jwt.sign({ userId: check._id.toString(), password: password }, "Secret key", { expiresIn: "5hr" })
            return res.status(201).send({ status: true, message: "Token generated", data: { userId: check._id, token: token } })
        }
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

//=======================================Get User Details=======================================================
const getUser = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!userId) return res.status(400).send({ status: false, message: "User Id should be present in params" })
        if (!isValidObjectIds(userId)) return res.status(400).send({ status: false, message: "Invalid userId" })

        const user = await userModel.findOne({ _id: userId })
        if (!user) return res.status(404).send({ status: false, message: "user not found" })

        return res.status(200).send({ status: true, message: "User details", data: user })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
//=======================================Update User Details=======================================================

const updateUser = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!userId) return res.status(400).send({ status: false, message: "enter the userId" })
        if (!isValidObjectIds(userId)) return res.status(400).send({ status: false, message: "Invalid userId" })

        let data = req.body
        let { fname, lname, email, profileImage, phone, password, address } = data
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "enter the data" })
        if (fname) {
            if (!isValid(fname)) return res.status(400).send({ status: false, message: "First Name is mandatory" })
            if (!validName(fname)) return res.status(400).send({ status: false, message: "First Name can only take alphabets" })
        }
        if (lname) {
            if (!isValid(lname)) return res.status(400).send({ status: false, message: "Last Name is mandatory" })
            if (!validName(lname)) return res.status(400).send({ status: false, message: "Last Name can only take alphabets" })
        }
        if (email) {
            if (!isValid(email)) return res.status(400).send({ status: false, message: "Enter Email Id" })
            if (!validEmail(email)) return res.status(400).send({ status: false, message: "Invalid Email Id" })
        }

        if (phone) {
            if (!isValid(phone)) return res.status(400).send({ status: false, message: "Enter Phone No" })
            if (!validPhone(phone)) return res.status(400).send({ status: false, message: "Invalid Phone No" })
        }

        if (profileImage) {
            let files = req.files
            if (!(files && files.length)) {
                return res.status(400).send({ status: false, message: "Please Provide The Profile Image" });
            }
            const uploadProfileImage = await uploadFile(files[0])
            data.profileImage = uploadProfileImage
        }

        if (password) {
            if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "Password should be between 8 to 15 characters and should contain atleast one uppercase & lowercase letter,a number and a special character" })
            password = await bcrypt.hash(password, 10)
            data.password = password
        }

        if (address) {
            address = JSON.parse(address)
            if (typeof address != "object") return res.status(400).send({ status: false, message: "address is in incorrect format" })

            //Shipping   
            if (address.shipping) {
                if (address.shipping.street) {
                    if (!isValid(address.shipping.street)) return res.status(400).send({ status: false, message: "shipping street is in wrong format" })
                }

                if (address.shipping.city) {
                    if (!isValid(address.shipping.city)) return res.status(400).send({ status: false, message: "shipping city is in wrong format" })
                    if (!validName(address.shipping.city)) return res.status(400).send({ status: false, message: "shipping city can only take Alphabets" })
                }

                if (address.shipping.pincode) {
                    if (typeof address.shipping.pincode != "number") return res.status(400).send({ status: false, message: "shipping pincode is in wrong format" })
                    if (!isValidPincode(address.shipping.pincode)) return res.status(400).send({ status: false, message: "Pincode should be 6 characters long" })
                }
            }
            //Billing
            if (address.billing) {
                if (address.billing.street) {
                    if (!isValid(address.billing.street)) return res.status(400).send({ status: false, message: "billing street is in wrong format" })
                }
                if (address.billing.city) {
                    if (!isValid(address.billing.city)) return res.status(400).send({ status: false, message: "billing city is in wrong format" })
                    if (!validName(address.billing.city)) return res.status(400).send({ status: false, message: "shipping city can only take Alphabets" })
                }
                if (address.billing.pincode) {
                    if (typeof address.billing.pincode != "number") return res.status(400).send({ status: false, message: "billing pincode is in incorrect format" })
                    if (!isValidPincode(address.billing.pincode)) return res.status(400).send({ status: false, message: "Pincode should be 6 characters long" })
                }
            }
        }

        data.address = address

        let updateData = await userModel.findOneAndUpdate({ _id: userId }, { $set: data },{new:true})
        if (!updateData) {
            return res.status(400).send({ status: false, message: "data not updated" })
        }
        else { return res.status(200).send({ status: true, message: "User profile updated", data: updateData }) }
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createUser, getUser, login, updateUser }










