const express = require('express')
const mongoose = require('mongoose')
const connectDB = require('../db')
const Goal = require('../models/Goal')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

function fmt(g) { return { ...g, id: g._id.toString(), _id: undefined } }

router.get('/', requireAuth, async (req, res) => {
  try {
    await connectDB()
    const goals = await Goal.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean()
    return res.json(goals.map(fmt))
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const { title } = req.body
    if (!title?.trim()) return res.status(422).json({ error: 'Title is required' })
    await connectDB()
    const goal = await Goal.create({ ...req.body, title: title.trim(), userId: req.user.id })
    return res.status(201).json(fmt(goal.toObject()))
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
})

router.get('/:id', requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID' })
    await connectDB()
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user.id }).lean()
    if (!goal) return res.status(404).json({ error: 'Goal not found' })
    return res.json(fmt(goal))
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
})

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID' })
    await connectDB()
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean()
    if (!goal) return res.status(404).json({ error: 'Goal not found' })
    return res.json(fmt(goal))
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID' })
    await connectDB()
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user.id })
    if (!goal) return res.status(404).json({ error: 'Goal not found' })
    return res.json({ message: 'Goal deleted' })
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
})

module.exports = router
