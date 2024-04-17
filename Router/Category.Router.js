const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Access = require('../Middleware/Auth.Middleware')
const CategoryModel = require('../Model/Category.model')

const CategoryRouter = express.Router()

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/categories')) // Adjust the uploads path as needed
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
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

// Access Middleware to protect routes
// CategoryRouter.use(Access)

// Create Category Endpoint
CategoryRouter.post('/', upload.single('image'), Access, async (req, res) => {
  // Destructure the necessary fields from req.body and req.file
  const { name, slug } = req.body
  const image = req.file.filename // Only store the filename
  const owner = req.id // Assuming Access middleware adds user to req.user

  // Validate the inputs
  if (!name || !slug || !image) {
    return res.status(400).json({ message: 'All fields are required: name, slug, and image' })
  }

  try {
    // Check for existing category with the same slug
    const existingCategory = await CategoryModel.findOne({ slug })
    if (existingCategory) {
      return res.status(409).json({ message: 'Category with this slug already exists' })
    }

    // Create and save the new category with the relative image path
    const newCategory = new CategoryModel({
      name,
      slug,
      image: `/uploads/categories/${image}`, // Storing relative path
      owner
    })

    await newCategory.save()
    res.status(201).json(newCategory)
  } catch (error) {
    console.error('Error creating category:', error)
    res.status(500).json({ message: 'Server error while creating category' })
  }
})

// Read All Categories Endpoint
CategoryRouter.get('/', async (req, res) => {
  const { name } = req.query

  try {
    const query = name ? { name: { $regex: name, $options: 'i' } } : {} // Case insensitive search
    const categories = await CategoryModel.find(query)
    res.json(categories)
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching categories' })
  }
})

// Read Single Category Endpoint
CategoryRouter.get('/:id', async (req, res) => {
  try {
    const category = await CategoryModel.findById(req.params.id)
    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }
    res.json(category)
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching category' })
  }
})

// Update Category Endpoint
CategoryRouter.patch('/:id', upload.single('image'), Access, async (req, res) => {
  const { name, slug } = req.body

  try {
    const category = await CategoryModel.findById(req.params.id)
    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    if (req.file) {
      // Delete the old image
      const oldImagePath = category.image
      fs.unlink(path.join(__dirname, '../', oldImagePath), (err) => {
        if (err) console.log('Failed to delete old image:', oldImagePath)
      })

      // Update with new image filename
      category.image = `/uploads/categories/${req.file.filename}` // Storing relative path
    }

    // Update name and slug if provided
    if (name) category.name = name
    if (slug) category.slug = slug

    await category.save()
    res.json({ message: 'Category updated', category })
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating category' })
  }
})

// Delete Category Endpoint
CategoryRouter.delete('/:id', async (req, res) => {
  try {
    const category = await CategoryModel.findById(req.params.id)
    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    // Delete the image from the filesystem
    const imagePath = category.image
    fs.unlink(path.join(__dirname, '../', imagePath), (err) => {
      if (err) console.log('Failed to delete image:', imagePath)
    })

    await category.remove()
    res.json({ message: 'Category deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting category' })
  }
})

module.exports = CategoryRouter
