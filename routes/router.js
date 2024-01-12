const express= require( "express")
const userModel = require ("../models/user.js")
const Blogs = require("../models/blog.js")
const Comments = require ("../models/comments.js")
const router = express.Router()
const sendEmail=require("../services/email.js")

const {
  createHmac, randomBytes
} = require('crypto');
const { validateToken } = require("../services/auth.js")

router.delete('/delete/:blogId', async (req, res) => {
  try {
    const blogId = req.params.blogId;
    // Add logic to delete the blog and its associated comments
    await Blogs.findByIdAndRemove(blogId);
    await Comments.deleteMany({ blogId });
    console.log("reched")
    return res.json({"msj":"ok"})
    // return res.redirect("/")
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get("/signin", (req, res) => {
return res.render("signin")
})

router.get("/signup", (req, res) => {
return res.render("signup")
})

router.get("/forgetpassword", (req, res) => {
return res.render("forgetpass")
})

router.get("/profile", (req, res) => {
return res.render("profile", {user: req.user})
})

router.get("/setting", (req, res) => {
return res.render("setting", {user: req.user, token: req.cookies.token})
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

router.post("/forgetpassword", async (req, res, next) => {
  try {
    const { email } = req.body
    const user = await userModel.findOne({ email })
    const token = await userModel.forgetpass(email)
    const resetURL = `${req.protocol}://${req.get('host')}/user/resetpass/${token.passToken}`
    const message= `We have received a password reset request, please use below link to set yoour passwor. It will expire in 10 mins \n\n${resetURL}\n\n`
    try {
        await sendEmail({
      email: email,
      subject: 'Password reset request',
      message: message,
        })
      console.log("mail sent")
      res.status(200).json({status: "success", message: "password sent succefully"})
    } catch (err) {
      user.passwordResetTime= undefined,
      user.passResetToken = undefined
      user.save({ validateBeforeSave: false })
      return next(new Error("There was an error sending email. Please try later"))
    }

  } catch (error) {
res.render('forgetpass',{error})
}
})


router.get("/resetpass/:token", async (req, res, next) => {
  let user
  user = await userModel.findOne({
    passResetToken: req.params.token,
    passwordResetTime: { $gt: Date.now() }
  });
  if (!user) {
    // const check = await validateToken(req.params.token)
    // const email = check.email
    // user = await userModel.findOne({email})
     return res.render("resetPassword", {error:"Token Expired", user: user }); 
  }
  console.log("user=============", user)
  return res.render("resetPassword", { user: user });
});

router.post("/resetpass/:token?", async (req, res, next) => {
  console.log("boy=============================", req.cookies.token)
  const { email, newPassword, confirmPassword } = req.body;
  user = await userModel.findOne({email});
 try {
   const result = await userModel.saveResetPass(email, newPassword, confirmPassword)
   console.log("result=---------------------0", result)
    if (result.email) {
    res.redirect("/")
    }
    else{
      return res.render("resetPassword", {error: "Password Didn't match", user: user, token:req.cookies.token });
   }
 } catch (error) {
   return res.render("resetPassword", {error: error, user: user });
 }
 
});


router.get('/search', async (req, res) => {
  try{
 const result = await Blogs.find();
    const { search } = req.query;
   const searchLowerCase = search.toLowerCase();
    // Filter the data to include only blogs with titles containing the search term (case-insensitive)
    const filteredData = result.filter(blog => blog.title.toLowerCase().includes(searchLowerCase));
    res.render("home", { blogs: filteredData })
    } catch (error) {
    console.error("Error in search route:", error);
    res.render("home", { blogs: "" })
  }
});

router.get('/logout', (req, res) => {
res.clearCookie('token').redirect("/user/signin")
})



module.exports= router