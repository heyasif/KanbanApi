const express = require('express')
const { UserModel } = require('../Model/User.Model')

const UserRouter = express.Router()

UserRouter.post('/login', async (req, res) => {
  res.status(200).json({ Messages: 'Login Page' })
})

UserRouter.post('/register', async (req, res) => {
  const { username, password, role } = req.body

  try {
    const User = await UserModel.findOne({ username })
    if (!User) {
      const newUser = new UserModel({
        username,
        password,
        role
      })

      await newUser.save()
      res.status(200).json({ Messages: 'Account Created Sucessfully' })
    } else {
      res.status(200).json({ Messages: 'User Already Exits' })
    }
  } catch (error) {
    res.status(400).json({ error })
  }
})
module.exports = { UserRouter }
