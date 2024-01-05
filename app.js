require('dotenv').config()
const express = require('express')
const path= require("path")
const app = express();
const router = require("./routes/router.js")
const blogRoute = require("./routes/blog.js")
const connectToDatabase = require("./connect/dbconnect.js")
const cookieParser = require('cookie-parser');
const { checkForAuthenticationCookie } = require('./middlewares/authentication.js');
const Blog= require('./models/blog.js')

const PORT = process.env.PORT
const url=process.env.MONGODB_URL
connectToDatabase(url)

// template engine
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())


app.set("view engine", "ejs")
app.set("views", path.resolve("./views"))
app.use(checkForAuthenticationCookie('token'))

app.get('/', async (req, res) => {
const allBlogs = await Blog.find({})
res.render("home", { user: req.user, blogs: allBlogs })
})

app.use("/user", router)
app.use("/blog", blogRoute)
app.use((req, res, next) => {
res.status(404).render('404'); // Render the 404 EJS template
});


app.listen(PORT, () => {
console.log(`server is up at port ${PORT}`)
})