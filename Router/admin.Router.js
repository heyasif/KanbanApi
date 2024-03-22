const express = require('express')
const Access = require('../Middleware/Access.Middleware')
const Auth = require('../Middleware/Auth.Middleware')
const TaskModel = require('../Model/Task.Model')

const adminRoute = express.Router()

adminRoute.post('/bulk', Auth, Access('admin'), async (req, res) => {
  const tasks = req.body
  const userId = req.id

  try {
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ message: 'Payload must be an array of tasks.' })
    }

    // Add user ID to each task
    const tasksWithUserId = tasks.map(task => ({ ...task, user: userId }))

    // Insert tasks into the database
    const createdTasks = await TaskModel.insertMany(tasksWithUserId)
    res.status(201).json(createdTasks)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error during bulk task creation.' })
  }
})

module.exports = adminRoute
