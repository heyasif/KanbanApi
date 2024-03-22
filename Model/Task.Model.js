const mongoose = require('mongoose')

const TaskSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: Date, required: true },
  status: { type: String, enum: ['todo', 'progress', 'done'], default: 'todo' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
})

const TaskModel = mongoose.model('Task', TaskSchema)

module.exports = TaskModel
