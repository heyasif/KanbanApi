const express = require('express')
const ConnectDatabase = require('./config/db')
const { UserRouter } = require('./Router/User.Router')
const cors = require('cors')

require('dotenv').config()

const app = express()
app.use(cors())

app.use(express.json())
app.use('/user', UserRouter)

app.listen(process.env.PORT, () => {
  ConnectDatabase()
  console.log(`Server Running on port ${process.env.PORT}`)
})
