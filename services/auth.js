const JWT = require("jsonwebtoken")

const secret = "blogger@143%5&&@#"

function createToken(user) {
  const payload = ({
    _id: user._id,
    email: user.email,
    username: user.fullname,
    profileImage: user.profileImage,
    role: user.role
  })

  const token = JWT.sign(payload, secret);
  return token
}


function validateToken(token) {
  const payload = JWT.verify(token, secret)
  return payload
}

module.exports={validateToken, createToken}