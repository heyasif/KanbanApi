const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require('path') // Include path module
const UserModel = require('../Model/User.Model') // Adjust the path if necessary
const Access = require('../Middleware/Auth.Middleware')
const UserRouter = express.Router()

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/users')) // Adjust the uploads path as needed
  },
  filename: function (req, file, cb) {
    // Replace colons and ensure the filename is safe for the filesystem
    const fileName = file.originalname.replace(/[^a-z0-9.]/gi, '_').toLowerCase()
    cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + fileName)
  }
})

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed!'), false)
  }
}

const upload = multer({ storage, fileFilter })

UserRouter.post('/register', upload.single('avatar'), async (req, res) => {
  const { fullName, userName, email, password } = req.body
  const avatar = req.file.filename // Only store the filename

  if (!fullName || !userName || !email || !password) {
    return res.status(400).json({ message: 'All fields must be filled out.' })
  }

  try {
    const existingUser = await UserModel.findOne({ $or: [{ userName }, { email }] })
    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new UserModel({
      fullName,
      userName,
      email,
      password: hashedPassword,
      avatar: `/uploads/users/${avatar}`
    })

    await newUser.save()
    res.status(201).json({ message: 'Account created successfully.', avatar })
  } catch (error) {
    console.error('Registration error:', error)
    return res.status(500).json({ message: 'Server error while creating user.', error: error.message })
  }
})

UserRouter.post('/login', async (req, res) => {
  const { userName, password } = req.body // Make sure the userName matches the case used in your schema and Postman request

  // Validate input
  if (!userName || !password) {
    return res.status(400).json({ message: 'Username and password are required.' })
  }

  try {
    // Find the user by username
    const user = await UserModel.findOne({ userName })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' }) // It's a good security practice not to reveal whether a username was found
    }

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    // User matched, create JWT payload
    const payload = {
      id: user._id
    }

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Make sure you have a JWT_SECRET in your .env file
      { expiresIn: 3600 }, // Token expires in 1 hour
      (err, token) => {
        if (err) throw err
        res.json({
          success: true,
          token: 'Bearer ' + token
        })
      }
    )
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error during login.' })
  }
})

UserRouter.patch('/profile', upload.single('avatar'), async (req, res) => {
  const { fullName, oldPassword, newPassword } = req.body
  const userId = req.id // Retrieved from the Access middleware
  const avatar = req.file ? req.file.path : null // Handling if a new file is uploaded
  console.log(userId)

  try {
    const user = await UserModel.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }

    // If the old password is provided, verify it and update to the new password
    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password)
      if (!isMatch) {
        return res.status(401).json({ message: 'Old password is incorrect.' })
      }

      user.password = await bcrypt.hash(newPassword, 10)
    }

    // Update fullName if provided
    if (fullName) {
      user.fullName = fullName
    }

    // Update avatar if a new file is uploaded
    if (avatar) {
      user.avatar = avatar
    }

    await user.save()

    res.json({ message: 'Profile updated successfully.' })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Server error while updating profile.' })
  }
})

UserRouter.get('/:id', async (req, res) => {
  const userId = req.params.id
  try {
    const user = await UserModel.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }
    const { _id, fullName, userName, email, avatar } = user
    res.json({ _id, fullName, userName, email, avatar })
  } catch (error) {
    console.error('Error fetching user details:', error)
    res.status(500).json({ message: 'Server error while fetching user details.' })
  }
})

module.exports = UserRouter
