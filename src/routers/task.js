const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')


router.post('/tasks', auth, async (req, res)=> {
  // const task = new Task(req.body)
  const task = new Task({
    ...req.body,
    owner: req.user._id
  })


  try{
    await task.save()
    res.send(task)
  } catch(e) {
    res.status(400).send(err)
  }
})

// Get /tasks?completed=true
// get /tasks?limit=10&skip=20
// Get /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res)=> {
  const match = {}
  const sort = {}
  if(req.query.completed) {
    match.completed = req.query.completed === 'true'
  }

  if(req.query.sortBy) {
    const parts = req.query.sortBy.split(':')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }
  try {
    // const tasks = await Task.find({owner: req.user._id })
    // const tasks = await Task.findById(req.user._id)
    // res.send(tasks)
    
    // yung tasks nsa userschema s model folder
    await req.user.populate({
      path: 'tasks',
      match: match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort: sort
      }
    }).execPopulate()
    res.send(req.user.tasks)
  } catch (e) {
    
    res.status(500).send()
  }
})

router.get('/tasks/:id', auth, async (req, res)=> {
  const _id = req.params.id

  try {
    // yung _id e task's id un, user nmn ung isa
    const task = await Task.findOne({ _id: _id, owner: req.user._id})
    if(!task) {
      return res.status(404).send()
    }
    res.send(task)
  } catch(e) {
    res.status(500).send()
  }
})

router.patch('/tasks/:id', auth, async (req, res) =>{
  const updates = Object.keys(req.body)
  const allowedUpdates = ['desc', 'completed']
  const isValidOperation = updates.every((update)=> {
    return allowedUpdates.includes(update)
  })

  if(!isValidOperation) {
    return res.status(400).send({error: 'Invalid Updates!'})
  }
  try {
    const task = await Task.findOne({_id: req.params.id, owner: req.user._id})

    if(!task) {
      return res.status(404).send()
    }
    updates.forEach((update)=> {
      task[update] = req.body[update]
    })
    await task.save()
    res.send(task)

  } catch(e) {
    res.status(400).send(e)
  }
})

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
    if(!task) {
      res.status(404).send()
    }
    res.send(task)
  } catch (e) {
    res.status(500).send(e)
  }
})

module.exports = router