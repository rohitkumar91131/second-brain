const express = require('express')
const mongoose = require('mongoose')
const connectDB = require('../db')
const Task = require('../models/Task')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

function fmt(t) { return { ...t, id: t._id.toString(), _id: undefined } }

// GET /api/tasks
router.get('/', requireAuth, async (req, res) => {
  try {
    await connectDB()
    const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean()
    return res.json(tasks.map(fmt))
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
})

// POST /api/tasks
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title } = req.body
    if (!title?.trim()) return res.status(422).json({ error: 'Title is required' })
    await connectDB()
    const task = await Task.create({ ...req.body, title: title.trim(), userId: req.user.id })
    return res.status(201).json(fmt(task.toObject()))
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
})

// GET /api/tasks/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID' })
    await connectDB()
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.id }).lean()
    if (!task) return res.status(404).json({ error: 'Task not found' })
    return res.json(fmt(task))
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
})

// PATCH /api/tasks/:id
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID' })
    await connectDB()
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean()
    if (!task) return res.status(404).json({ error: 'Task not found' })
    return res.json(fmt(task))
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
})

// DELETE /api/tasks/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID' })
    await connectDB()
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id })
    if (!task) return res.status(404).json({ error: 'Task not found' })
    return res.json({ message: 'Task deleted' })
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
})

module.exports = router
