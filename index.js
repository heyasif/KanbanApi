const express = require('express')
const path = require('path')

const ConnectDatabase = require('./config/db')
const cors = require('cors')
const UserRouter = require('./Router/User.Router')
const CategoryRouter = require('./Router/Category.Router')
const ProductRouter = require('./Router/Product.route')
require('dotenv').config()

const app = express()
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use(cors())

app.use(express.json())
app.use('/users', UserRouter)
app.use('/category', CategoryRouter)
app.use('/products', ProductRouter)

app.listen(process.env.PORT, () => {
  ConnectDatabase()
  console.log(`Server Running on port ${process.env.PORT}`)
})
