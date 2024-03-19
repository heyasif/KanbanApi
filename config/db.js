const mongoose = require('mongoose')
const ConnectDatabase = async () => {
  try {
    await mongoose.connect(process.env.DB_URL)
    console.log('Connected Database')
  } catch (error) {
    console.log(error)
  }
}
module.exports = ConnectDatabase
