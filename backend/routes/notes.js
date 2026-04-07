const express = require('express')
const connectDB = require('../db')
const Note = require('../models/Note')
const Block = require('../models/Block')
const { requireAuth } = require('../middleware/auth')
const mongoose = require('mongoose')

const router = express.Router()

function formatNote(n) {
  return { ...n, id: n._id.toString(), _id: undefined }
}

// GET /api/notes
router.get('/', requireAuth, async (req, res) => {
  try {
    await connectDB()
    const { archived, deleted } = req.query
    const query = { userId: req.user.id }

    if (deleted === 'true') {
      query.deletedAt = { $ne: null }
    } else if (archived === 'true') {
      query.isArchived = true
      query.deletedAt = null
    } else {
      query.isArchived = false
      query.deletedAt = null
    }

    const notes = await Note.find(query).sort({ updatedAt: -1 }).lean()
    return res.json(notes.map(formatNote))
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/notes
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, tags, areaId, projectIds, preview, isPinned } = req.body
    if (!title || !title.trim()) return res.status(422).json({ error: 'Title is required' })

    await connectDB()
    const note = await Note.create({
      title: title.trim(),
      tags: tags || [],
      areaId: areaId || null,
      projectIds: projectIds || [],
      preview: preview || '',
      isPinned: isPinned || false,
      userId: req.user.id,
    })
    return res.status(201).json(formatNote(note.toObject()))
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/notes/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID' })
    await connectDB()
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id }).lean()
    if (!note) return res.status(404).json({ error: 'Note not found' })
    return res.json(formatNote(note))
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /api/notes/:id
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID' })
    await connectDB()
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean()
    if (!note) return res.status(404).json({ error: 'Note not found' })
    return res.json(formatNote(note))
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/notes/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID' })
    await connectDB()
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id })
    if (!note) return res.status(404).json({ error: 'Note not found' })
    // Also delete blocks
    await Block.deleteMany({ entityId: req.params.id, entityType: 'Note' })
    return res.json({ message: 'Note deleted' })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/notes/:id/blocks
router.get('/:id/blocks', requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID' })
    await connectDB()
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id }).lean()
    if (!note) return res.status(404).json({ error: 'Note not found' })
    const blocks = await Block.find({ entityId: req.params.id, entityType: 'Note' }).sort({ order: 1 }).lean()
    return res.json(blocks.map(b => ({ ...b, id: b._id.toString(), _id: undefined })))
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
