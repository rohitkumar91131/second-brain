const express = require('express')
const mongoose = require('mongoose')
const connectDB = require('../db')
const Project = require('../models/Project')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

function fmt(p) { return { ...p, id: p._id.toString(), _id: undefined } }

// TEMPORARY: All users can access all projects (exam prep)
router.get('/', requireAuth, async (req, res) => {
  try {
    await connectDB()
    // TEMP: Removed userId filter
    const projects = await Project.find({}).sort({ createdAt: -1 }).lean()
    return res.json(projects.map(fmt))
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const { title } = req.body
    if (!title?.trim()) return res.status(422).json({ error: 'Title is required' })
    await connectDB()
    const project = await Project.create({ ...req.body, title: title.trim(), userId: req.user.id })
    return res.status(201).json(fmt(project.toObject()))
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
})

// TEMPORARY: All users can access all projects
router.get('/:id', requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID' })
    await connectDB()
    // TEMP: Removed userId check
    const project = await Project.findOne({ _id: req.params.id }).lean()
    if (!project) return res.status(404).json({ error: 'Project not found' })
    return res.json(fmt(project))
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
})

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID' })
    await connectDB()
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean()
    if (!project) return res.status(404).json({ error: 'Project not found' })
    return res.json(fmt(project))
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID' })
    await connectDB()
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user.id })
    if (!project) return res.status(404).json({ error: 'Project not found' })
    return res.json({ message: 'Project deleted' })
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
})

module.exports = router
