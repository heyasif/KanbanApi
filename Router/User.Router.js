const express = require('express')
const bcrypt = require('bcrypt')
const { UserModel } = require('../Model/User.Model')

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

UserRouter.get('/login', async (req, res) => {
  const { username, password } = req.body

  try {
    const existingUser = await UserModel.findOne({ username })
    if (existingUser) {
      const hashedpass = await bcrypt.compare(password, existingUser.password)
      if (hashedpass) {
        res.status(200).json({ message: 'Login Sucessfull' })
      } else {
        res.status(200).json({ message: 'Wrong Password' })
      }
    } else {
      res.status(400).json({ Message: 'User Not Found' })
    }
  } catch (error) {
    res.status(500).json({ error })
  }
})

module.exports = { UserRouter }
