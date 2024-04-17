const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { ProductModel } = require('../Model/Product.model') // Adjust path as necessary
const Access = require('../Middleware/Auth.Middleware') // Adjust path as necessary

const ProductRouter = express.Router()

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/products')) // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed!'), false)
  }
}

const upload = multer({ storage, fileFilter })

// POST endpoint to create a new product
ProductRouter.post('/', upload.single('image'), Access, async (req, res) => {
  const { title, description, price, category } = req.body
  const image = req.file ? req.file.path : null
  const owner = req.user._id // Assuming user ID is added to req.user by Access middleware

  if (!title || !price || !category || !image) {
    return res.status(400).json({ message: 'Missing required fields: title, price, category, and image.' })
  }

  try {
    const newProduct = new ProductModel({ title, description, price, category, image, owner })
    await newProduct.save()
    res.status(201).json(newProduct)
  } catch (error) {
    console.error('Error creating product:', error)
    res.status(500).json({ message: 'Server error while creating product' })
  }
})

// GET endpoint to fetch all products or search by title, sorted by price, filtered by category
ProductRouter.get('/', async (req, res) => {
  const { title, sort, category } = req.query
  const query = {}
  if (title) query.title = { $regex: title, $options: 'i' }
  if (category) query.category = category

  try {
    let products = ProductModel.find(query)
    if (sort === 'price') {
      products = products.sort({ price: 1 }) // Sort by price ascending
    }
    const results = await products
    res.json(results)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ message: 'Server error while fetching products' })
  }
})

// GET endpoint to fetch a single product by ID
ProductRouter.get('/:id', async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id).populate('category', 'name')
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ message: 'Server error while fetching product' })
  }
})

// PATCH endpoint to update a product
ProductRouter.patch('/:id', upload.single('image'), Access, async (req, res) => {
  const { title, description, price, category } = req.body

  try {
    const product = await ProductModel.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    if (req.file) {
      const oldImagePath = product.image
      // Delete old image if exists
      if (oldImagePath) {
        fs.unlink(path.join(__dirname, '../', oldImagePath), err => {
          if (err) console.log('Failed to delete old image:', oldImagePath)
        })
      }
      product.image = req.file.path
    }

    if (title) product.title = title
    if (description) product.description = description
    if (price) product.price = parseFloat(price)
    if (category) product.category = category

    await product.save()
    res.json({ message: 'Product updated successfully', product })
  } catch (error) {
    console.error('Error updating product:', error)
    res.status(500).json({ message: 'Server error while updating product' })
  }
})

// DELETE endpoint to delete a product
ProductRouter.delete('/:id', Access, async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    if (product.image) {
      fs.unlink(path.join(__dirname, '../', product.image), err => {
        if (err) console.log('Failed to delete image:', product.image)
      })
    }

    await product.remove()
    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    res.status(500).json({ message: 'Server error while deleting product' })
  }
})

module.exports = ProductRouter
