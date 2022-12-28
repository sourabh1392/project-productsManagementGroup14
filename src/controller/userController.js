const userModel = require("../model/userModel")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { uploadFile } = require("../aws")
const { validName, isValid, validPhone, validEmail, isValidPincode, isValidPassword, isValidObjectIds } = require('../validator/validation')


//=======================================Create User=================================================================
const createUser = async function (req, res) {
    try {
        let data = req.body
        let { fname, lname, email, phone, password, address } = data
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "enter the data" })

        //First Name
        if (!fname) return res.status(400).send({ status: false, message: "First Name is mandatory" })
        if (!validName(fname)) return res.status(400).send({ status: false, message: "First Name can only take alphabets" })

        //Last Name
        if (!lname) return res.status(400).send({ status: false, message: "Last Name is mandatory" })
        if (!validName(lname)) return res.status(400).send({ status: false, message: "Last Name can only take alphabets" })

        //Email
        if (!email) return res.status(400).send({ status: false, message: "Email is mandatory" })
        if (!validEmail(email)) return res.status(400).send({ status: false, message: "Invalid Email Id" })
        let emailExist = await userModel.findOne({ email: email })
        if (emailExist) return res.status(400).send({ status: false, message: "Email Id already exists" })

        
        //Profile Image
        let files = req.files
        if (!(files && files.length)) {
            return res.status(400).send({ status: false, message: "Please Provide The Profile Image" });
        }
        const uploadProfileImage = await uploadFile(files[0])
        data.profileImage = uploadProfileImage
        
        //Phone
        if (!phone) return res.status(400).send({ status: false, message: "Phone No is mandatory" })
        if (!validPhone(phone)) return res.status(400).send({ status: false, message: "Invalid Phone No" })
        let phoneExist = await userModel.findOne({ phone: phone })
        if (phoneExist) return res.status(400).send({ status: false, message: "Phone No already exists" })

        //Password
        if (!password) return res.status(400).send({ status: false, message: "password is mandatory" })
        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "Password should be between 8 to 15 characters and should contain atleast one uppercase & lowercase letter,a number and a special character" })
        password = await bcrypt.hash(password, 10)
        data.password = password

        //Address
        if (address) {
            address = JSON.parse(address)
            if (typeof address != "object") return res.status(400).send({ status: false, message: "address is in incorrect format" })

            //Shipping   
            if (address.shipping) {
                if (address.shipping.street) {
                    if (!isValid(address.shipping.street)) return res.status(400).send({ status: false, message: "shipping street is in wrong format" })
                } else return res.status(400).send({ status: false, message: "shipping street is mandatory" })

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

//========================================== Login ============================================================
const login = async function (req, res) {
    try {
        const email = req.body.email
        const password = req.body.password
        const check = await userModel.findOne({ email: email })
        if (!check) return res.status(400).send({ status: false, message: "Please provide correct credentials" })
        const passCompare = await bcrypt.compare(password, check.password)

        if (!passCompare) return res.status(400).send({ status: false, message: "please provide correct credentials" })
        else {
            const token = jwt.sign({ userId: check._id.toString(), password: password }, "Secret key", { expiresIn: "5hr" })
            return res.status(200).send({ status: true, message: "User Login Successfull", data: { userId: check._id, token: token } })
        }
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

//======================================= Get User Details ================================================
const getUser = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!isValidObjectIds(userId)) return res.status(400).send({ status: false, message: "Invalid userId" })
        let findUser= await userModel.findById(userId)
        if(!findUser) return res.status(404).send({status:false, message: "user not found"})

        return res.status(200).send({ status: true, message: "User profile details", data: findUser })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
//======================================= Update User Details ==============================================

const updateUser = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!isValidObjectIds(userId)) return res.status(400).send({ status: false, message: "Invalid userId" })
        let findUser= await userModel.findById(userId)
        if(!findUser) return res.status(404).send({status:false, message: "user not found"})

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
            let emailExist = await userModel.findOne({ email: email })
            if (emailExist) return res.status(400).send({ status: false, message: "Email Id already exists" }) }

        if (phone) {
            if (!isValid(phone)) return res.status(400).send({ status: false, message: "Enter Phone No" })
            if (!validPhone(phone)) return res.status(400).send({ status: false, message: "Invalid Phone No" })
            let phoneExist = await userModel.findOne({ phone: phone })
            if (phoneExist) return res.status(400).send({ status: false, message: "Phone No already exists" })
    
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

        let obj = {}
        if (address) {
            address = JSON.parse(address)
            if (typeof address != "object") return res.status(400).send({ status: false, message: "address is in incorrect format" })

            //Shipping   
            if (address.shipping) {
                if (address.shipping.street) {
                    if (!isValid(address.shipping.street)) return res.status(400).send({ status: false, message: "shipping street is in wrong format" })
                    obj['address.shipping.street'] = address.shipping.street
                }

                if (address.shipping.city) {
                    if (!isValid(address.shipping.city)) return res.status(400).send({ status: false, message: "shipping city is in wrong format" })
                    if (!validName(address.shipping.city)) return res.status(400).send({ status: false, message: "shipping city can only take Alphabets" })
                    obj['address.shipping.city'] = address.shipping.city
                }

                if (address.shipping.pincode) {
                    if (typeof address.shipping.pincode != "number") return res.status(400).send({ status: false, message: "shipping pincode is in wrong format" })
                    if (!isValidPincode(address.shipping.pincode)) return res.status(400).send({ status: false, message: "Pincode should be 6 characters long" })
                    obj['address.shipping.pincode'] = address.shipping.pincode
                }
            }
            //Billing
            if (address.billing) {
                if (address.billing.street) {
                    if (!isValid(address.billing.street)) return res.status(400).send({ status: false, message: "billing street is in wrong format" })
                    obj['address.billing.street'] = address.billing.street
                }
                if (address.billing.city) {
                    if (!isValid(address.billing.city)) return res.status(400).send({ status: false, message: "billing city is in wrong format" })
                    if (!validName(address.billing.city)) return res.status(400).send({ status: false, message: "shipping city can only take Alphabets" })
                    obj['address.billing.city'] = address.billing.city
                }
                if (address.billing.pincode) {
                    if (typeof address.billing.pincode != "number") return res.status(400).send({ status: false, message: "billing pincode is in incorrect format" })
                    if (!isValidPincode(address.billing.pincode)) return res.status(400).send({ status: false, message: "Pincode should be 6 characters long" })
                    obj['address.billing.pincode'] = address.billing.pincode
                }
            }
        }

        delete data.address

        let updateData = await userModel.findOneAndUpdate({ _id: userId }, { ...data, ...obj }, { new: true })
        return res.status(200).send({ status: true, message: "User profile updated", data: updateData })
    }

    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createUser, getUser, login, updateUser }