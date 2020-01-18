const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const taskSchema = new mongoose.Schema(
  {
    desc: {
      type: String,
      trim: true,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      // dapat same sya s user sa my user.model
      ref: 'User'
    }
  }, {
    timestamps: true
  })

  const Task = mongoose.model('Task', taskSchema)

module.exports = Task