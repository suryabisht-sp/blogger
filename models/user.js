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
  passwordResetTime: { type: Date},
  passResetToken: { type: String }
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

userSchema.static("forgetpass", async function (email) {
  try {
    // Check if the user exists
    const user = await this.findOne({ email });
    if (!user) {
      throw new Error("Email not registered with us");
    }
    const salt = user.salt;
    const resetToken = "password";
    // Update the user with the new values
    const updatedUser = await this.findOneAndUpdate(
      { email },
      {
        $set: {
          passResetToken: createHmac('sha256', salt).update(resetToken).digest("hex"),
          passwordResetTime: new Date(Date.now() + 30 * 60 * 1000)
        }
      },
      { new: true, runValidators: true }
    );
    return {
      passToken: updatedUser.passResetToken,
      passTime: updatedUser.passwordResetTime,
      user: updatedUser
    };
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
});

userSchema.static("saveResetPass", async function (email, password, cpass) {
  try {
    // Check if the user exists
    const user = await this.findOne({ email });
    if (!user) {
      throw new Error("Email not registered with us");
    }
    const salt = user.salt;
     // Update the user with the new values
    if (password !== cpass) {
     return new Error ("Password didn't matched")
    }
    const updatedUser = await this.findOneAndUpdate(
      { email },
      {
        $set: {
          password:createHmac('sha256', salt).update(password).digest("hex"),
          passResetToken: null,
          passwordResetTime: null,
        }
      },
      { new: true, runValidators: true }
    );
    return {
     user: updatedUser
    };
  } catch (error) {
    console.error("Error updating user's password:", error);
    throw new Error("Failed to update user password");
  }
});



const userModel = mongoose.model("userBlog", userSchema);

module.exports = userModel;