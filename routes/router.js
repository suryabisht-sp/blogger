const express= require( "express")
const userModel = require ("../models/user.js")

const router = express.Router()

router.get("/signin", (req, res) => {
return res.render("signin")
})

router.get("/signup", (req, res) => {
return res.render("signup")
})

router.post("/signup", async(req, res) => {
const { fullname, email, password } = req.body
await userModel.create({
fullname,
email,
password
})
return res.status(200).redirect("/")
})


router.post("/signin", async (req, res) => {
try {
const { email, password } = req.body
const token = await userModel.matchPassword(email, password)
return res.cookie('token', token, {error:null}).status(200).redirect("/")
} catch (error) {
res.render('signin',{error:"Incorrect Email or Password"})
}
})

router.get('/logout', (req, res) => {
res.clearCookie('token').redirect("/")
})

module.exports= router