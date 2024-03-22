const express = require('express')
const Auth = require('../Middleware/Auth.Middleware')
const Access = require('../Middleware/Access.Middleware')
const TaskModel = require('../Model/Task.Model')
const TaskRouter = express.Router()

TaskRouter.get('/', Auth, Access('user', 'admin'), async (req, res) => {
  try {
    if (req.role === 'admin') {
      const Tasks = await TaskModel.find()
      res.status(400).json({ Tasks })
    } else {
      const Tasks = await TaskModel.find({ user: req.id })
      res.status(400).json({ Tasks })
    }
  } catch (error) {
    res.status(500).json({ error })
  }
})

TaskRouter.post('/', Auth, Access('user', 'admin'), async (req, res) => {
  const { title, description, deadline } = req.body

  try {
    const newTask = new TaskModel({
      title,
      description,
      deadline: new Date(deadline),
      user: req.id

    })

    await newTask.save()
    res.status(200).json({ Message: 'Task Created' })
  } catch (error) {
    res.status(500).json({ error })
  }
})

TaskRouter.patch('/:taskID', Auth, Access('user', 'admin'), async (req, res) => {
  const payload = req.body
  const { taskID } = req.params

  try {
    const FindUser = await TaskModel.findById(taskID)
    const TaskUserID = FindUser.user.toString()

    if (req.role === 'admin') {
      await TaskModel.findByIdAndUpdate(taskID, payload)
      res.status(400).json({ Message: 'Task is Updated' })
    } else {
      if (req.id === TaskUserID) {
        await TaskModel.findByIdAndUpdate(taskID, { payload })
        res.status(400).json({ Message: 'Task is Updated' })
      } else {
        res.status(400).json({ Message: 'You Are Not Allowed' })
      }
    }

    // res.status(200).json({ Message: 'Task Created' })
  } catch (error) {
    res.status(500).json({ error })
  }
})

TaskRouter.delete('/:taskID', Auth, Access('user', 'admin'), async (req, res) => {
  const { taskID } = req.params

  try {
    const FindUser = await TaskModel.findById(taskID)
    const TaskUserID = FindUser.user.toString()

    if (req.role === 'admin') {
      await TaskModel.findByIdAndDelete(taskID)
      res.status(400).json({ Message: 'Task is Deleted' })
    } else {
      if (req.id === TaskUserID) {
        await TaskModel.findByIdAndDelete(taskID)
        res.status(400).json({ Message: 'Task is Deleted' })
      } else {
        res.status(400).json({ Message: 'You Are Not Allowed' })
      }
    }

    // res.status(200).json({ Message: 'Task Created' })
  } catch (error) {
    res.status(500).json({ error })
  }
})

module.exports = TaskRouter
