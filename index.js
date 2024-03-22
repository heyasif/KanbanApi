const express = require('express')
const ConnectDatabase = require('./config/db')
const { UserRouter } = require('./Router/User.Router')
const cors = require('cors')
const TaskRouter = require('./Router/Task.Router')
const adminRoute = require('./Router/admin.Router')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

require('dotenv').config()

const app = express()

// Define options for Swagger documentation
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kanban Board API',
      version: '1.0.0',
      description: 'API documentation for Kanban Board project'
    },
    servers: [
      {
        url: 'http://localhost:3000' // Update with your actual server URL
      }
    ]
  },
  apis: ['./Router/*.js'] // Path to the files containing API routes
}

// Initialize Swagger-jsdoc
const specs = swaggerJsdoc(options)

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

app.use(cors())

app.use(express.json())
app.use('/user', UserRouter)
app.use('/task', TaskRouter)
app.use('/admin', adminRoute)

app.listen(process.env.PORT, () => {
  ConnectDatabase()
  console.log(`Server Running on port ${process.env.PORT}`)
})
