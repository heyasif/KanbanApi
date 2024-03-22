const express = require('express')
const bcrypt = require('bcrypt')
const { UserModel } = require('../Model/User.Model')
const jwt = require('jsonwebtoken')

const UserRouter = express.Router()

UserRouter.post('/register', async (req, res) => {
  const { username, password, role } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' })
  }

  try {
    const existingUser = await UserModel.findOne({ username })
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' })
    }

    const hashedPassword = await bcrypt.hash(password, 5)

    const newUser = new UserModel({
      username,
      password: hashedPassword,
      role
    })

    await newUser.save()
    res.status(201).json({ message: 'Account created successfully.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error while creating user.' })
  }
})

UserRouter.post('/login', async (req, res) => {
  const { username, password } = req.body

  try {
    const existingUser = await UserModel.findOne({ username })
    if (!existingUser) {
      return res.status(400).json({ message: 'User not found.' }) // Consistency in response message structure
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password)
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Wrong password.' }) // Use 401 for authentication errors
    }

    const token = jwt.sign({ userID: existingUser._id }, process.env.JWT_KEY, { expiresIn: '1h' }) // Example expiration set
    res.status(200).json({ message: 'Login successful', token, info: existingUser })
  } catch (error) {
    console.error('Login error:', error) // Logging the error
    res.status(500).json({ message: 'An error occurred during the login process.' }) // Avoid sending raw error objects
  }
})

module.exports = { UserRouter }
