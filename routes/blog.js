const express= require( "express")
const Blog = require("../models/blog.js")
const multer = require('multer')
const path = require("path")
const Comments = require("../models/comments.js")
const router = express.Router()

const storage = multer.diskStorage({
destination: function (req, file, cb) {
cb(null, path.resolve(`./public/uploads`))
},
filename: function (req, file, cb) {
const filename= `${Date.now()}-${file.originalname}`
cb(null, filename)
}
})
const upload = multer({ storage: storage })

router.get('/add-new', (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  })
})

router.post('/', upload.single('coverImage'), async (req, res) => {
const {title, body}=req.body
const result = await Blog.create({
title,
body,
createdBy: req.user._id,
coverImageUrl: `/uploads/${req.file.filename}`
})
return res.redirect(`/blog/${result._id}`)
})

router.get(`/:id`,async (req, res) => { 
  const blog = await Blog.findById(req.params.id).populate("createdBy")
  const comments = await Comments.find({ blogId: req.params.id }).populate("createdBy")
  return res.render('blog-detail', { user: req.user, blog, comments })
})

router.post('/comment/:blogId', async (req, res) => {
  const comment = await Comments.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
    CreatedAt: Date.now(),
  })
  return res.redirect(`/blog/${req.params.blogId}`)
})

router.get('/edit/:blogId', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId).populate("createdBy");
    // console.log("trying==============================", blog)
    const comments = await Comments.find({ blogId: req.params.blogId }).populate("createdBy");

    return res.render('editBlog', { user: req.user, blog, comments });
  } catch (error) {
    console.error(error);
    // Handle the error appropriately, for example, redirecting to an error page or sending a 500 response.
    return res.status(500).send('Internal Server Error');
  }
});

// router.delete('/delete/:blogId', async (req, res) => {
//   try {
//     const blogId = req.params.blogId;
//     console.log("response==============================", blogId)
//     // Add logic to delete the blog and its associated comments
//     await Blog.findByIdAndRemove(blogId);
//     await Comments.deleteMany({ blogId });
//  res.render("home", { user: req.user })
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   }
// });



module.exports= router