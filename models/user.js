const mongoose = require("mongoose")

const { Schema } = require("mongoose")
const {
  createHmac, randomBytes
} = require('crypto');
const { error } = require("console");
const { createToken } = require("../services/auth");

const userSchema = new Schema({
  fullname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default: "/images/user.png"
  },
  salt: {
    type: String,
  },
  role: {
    type: String,
    enum: ["user", "Admin"],
    default: "user"
  },
})


userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return
  const salt = randomBytes(16).toString()
  const hashPassword = createHmac('sha256', salt).update(user.password).digest("hex")
  this.salt = salt;
  this.password = hashPassword
  next()
})

userSchema.static("matchPassword", async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error("user not found");
  const salt = user.salt;
  const hashPassword = user.password
  const userprovided = createHmac('sha256', salt).update(password).digest("hex")
  if (hashPassword !== userprovided) {
    throw new Error("invalid password")
  }
  const token = createToken(user)
  return token;

})

const userModel = mongoose.model("userBlog", userSchema);

module.exports = userModel;