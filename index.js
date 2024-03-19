const express = require('express')
const ConnectDatabase = require('./config/db')

require('dotenv').config()

const app = express()
app.use(express.json())

app.use('/', (req, res) => {
  res.status(200).json({ Messages: 'Homepage' })
})

app.listen(process.env.PORT, () => {
  ConnectDatabase()
  console.log(`Server Running on port ${process.env.PORT}`)
})
