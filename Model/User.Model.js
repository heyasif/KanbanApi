const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
})
const UserModel = mongoose.model('User', UserSchema)
module.exports = { UserModel }
