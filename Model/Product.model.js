const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  image: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
})

const ProductModel = mongoose.model('Product', productSchema)
module.exports = ProductModel
