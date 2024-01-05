const mongoose = require("mongoose")

const { Schema } = require("mongoose")
const Blog = require("./blog")
const userModel = require("./user")

const commentSchema = new Schema({
content: {
type: String,
required: true
},
createdBy: {
type: Schema.Types.ObjectId,
ref:userModel
},
blogId: {
type: Schema.Types.ObjectId,
ref: Blog
},
  CreatedAt: {
    type: String,
    date: Date.now(),
}
})

const Comments = mongoose.model("comment", commentSchema)

module.exports=Comments