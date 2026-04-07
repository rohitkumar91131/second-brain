const express = require('express')
const mongoose = require('mongoose')
const connectDB = require('../db')
const Block = require('../models/Block')
const Note = require('../models/Note')
const JournalEntry = require('../models/JournalEntry')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

async function updateEntityPreview(entityId, entityType) {
  try {
    const blocks = await Block.find({ entityId, entityType }).sort({ order: 1 }).limit(5).lean()
    const preview = blocks
      .filter(b => ['paragraph', 'bullet', 'numbered', 'callout'].includes(b.type))
      .map(b => b.content)
      .join(' ')
      .slice(0, 300)

    if (entityType === 'Note') {
      await Note.findByIdAndUpdate(entityId, { preview })
    } else if (entityType === 'JournalEntry') {
      await JournalEntry.findByIdAndUpdate(entityId, { preview })
    }
  } catch (e) {
    console.error('Preview update error:', e)
  }
}

// POST /api/blocks
router.post('/', requireAuth, async (req, res) => {
  try {
    const { entityId, entityType, type, content, order, parentId } = req.body
    if (!entityId || !entityType || !type || order === undefined) {
      return res.status(422).json({ error: 'entityId, entityType, type, order are required' })
    }
    if (!mongoose.Types.ObjectId.isValid(entityId)) return res.status(400).json({ error: 'Invalid entityId' })

    await connectDB()
    const userId = new mongoose.Types.ObjectId(req.user.id)
    const castedEntityId = new mongoose.Types.ObjectId(entityId)

    if (entityType === 'Note') {
      const note = await Note.findOne({ _id: castedEntityId, userId }).lean()
      if (!note) return res.status(404).json({ error: 'Note not found' })
    } else if (entityType === 'JournalEntry') {
      const entry = await JournalEntry.findOne({ _id: castedEntityId, userId }).lean()
      if (!entry) return res.status(404).json({ error: 'Journal entry not found' })
    }

    const block = await Block.create({
      entityId: castedEntityId,
      entityType,
      type,
      content: content || '',
      order,
      parentId: mongoose.Types.ObjectId.isValid(parentId) ? new mongoose.Types.ObjectId(parentId) : null,
    })

    await updateEntityPreview(castedEntityId, entityType)

    return res.status(201).json({ ...block.toObject(), id: block._id.toString(), _id: undefined })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/blocks/media  — list media blocks
router.get('/media', requireAuth, async (req, res) => {
  try {
    await connectDB()
    const userId = new mongoose.Types.ObjectId(req.user.id)

    // Get all notes for this user
    const notes = await Note.find({ userId }).select('_id').lean()
    const noteIds = notes.map(n => n._id)

    const mediaBlocks = await Block.find({
      entityId: { $in: noteIds },
      entityType: 'Note',
      type: { $in: ['image', 'video', 'audio'] },
    }).sort({ createdAt: -1 }).lean()

    return res.json(mediaBlocks.map(b => ({ ...b, id: b._id.toString(), _id: undefined })))
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PUT /api/blocks/bulk  — bulk update blocks
router.put('/bulk', requireAuth, async (req, res) => {
  try {
    const updates = req.body
    if (!Array.isArray(updates) || updates.length === 0) return res.status(400).json({ error: 'Body must be a non-empty array of block updates' })

    await connectDB()
    const userId = new mongoose.Types.ObjectId(req.user.id)

    // Verify that all blocks belong to the user
    const blockIds = updates.map(u => u.id).filter(id => mongoose.Types.ObjectId.isValid(id))
    const blocks = await Block.find({ _id: { $in: blockIds } }).lean()

    for (const block of blocks) {
      const owned = block.entityType === 'Note'
        ? await Note.exists({ _id: block.entityId, userId })
        : await JournalEntry.exists({ _id: block.entityId, userId })
      if (!owned) return res.status(403).json({ error: 'Forbidden' })
    }

    const ops = updates.map(u => ({
      updateOne: {
        filter: { _id: u.id },
        update: { $set: { type: u.type, content: u.content, order: u.order, parentId: u.parentId } },
      },
    }))

    await Block.bulkWrite(ops)

    if (updates.length > 0 && updates[0].entityId) {
      await updateEntityPreview(updates[0].entityId, updates[0].entityType || 'Note')
    }

    return res.json({ message: 'Blocks updated' })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/blocks/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID' })
    await connectDB()
    const block = await Block.findById(req.params.id).lean()
    if (!block) return res.status(404).json({ error: 'Block not found' })

    // Verify ownership via entity
    const userId = new mongoose.Types.ObjectId(req.user.id)
    const owned = block.entityType === 'Note'
      ? await Note.exists({ _id: block.entityId, userId })
      : await JournalEntry.exists({ _id: block.entityId, userId })
    if (!owned) return res.status(403).json({ error: 'Forbidden' })

    return res.json({ ...block, id: block._id.toString(), _id: undefined })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /api/blocks/:id
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID' })
    await connectDB()
    const block = await Block.findById(req.params.id).lean()
    if (!block) return res.status(404).json({ error: 'Block not found' })

    // Verify ownership via entity
    const userId = new mongoose.Types.ObjectId(req.user.id)
    const owned = block.entityType === 'Note'
      ? await Note.exists({ _id: block.entityId, userId })
      : await JournalEntry.exists({ _id: block.entityId, userId })
    if (!owned) return res.status(403).json({ error: 'Forbidden' })

    const updated = await Block.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean()

    await updateEntityPreview(block.entityId, block.entityType)

    return res.json({ ...updated, id: updated._id.toString(), _id: undefined })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/blocks/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID' })
    await connectDB()
    const block = await Block.findById(req.params.id).lean()
    if (!block) return res.status(404).json({ error: 'Block not found' })

    // Verify ownership via entity
    const userId = new mongoose.Types.ObjectId(req.user.id)
    const owned = block.entityType === 'Note'
      ? await Note.exists({ _id: block.entityId, userId })
      : await JournalEntry.exists({ _id: block.entityId, userId })
    if (!owned) return res.status(403).json({ error: 'Forbidden' })

    await Block.findByIdAndDelete(req.params.id)
    await updateEntityPreview(block.entityId, block.entityType)

    return res.json({ message: 'Block deleted' })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
