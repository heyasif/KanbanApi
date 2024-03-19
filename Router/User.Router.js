const express = require('express')

const UserRouter = express.Router()

UserRouter.get('/login', (req, res) => {
  res.status(200).json({ Messages: 'Login Page' })
})

UserRouter.get('/register', (req, res) => {
  res.status(200).json({ Messages: 'Register Page' })
})
module.exports = { UserRouter }
