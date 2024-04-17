// Assuming UserModel is defined in User.model.js
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  userName: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date
})

const UserModel = mongoose.model('User', userSchema)
module.exports = UserModel
