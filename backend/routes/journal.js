const express = require('express')
const mongoose = require('mongoose')
const connectDB = require('../db')
const JournalEntry = require('../models/JournalEntry')
const Block = require('../models/Block')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

function fmt(e) { return { ...e, id: e._id.toString(), _id: undefined } }

router.get('/', requireAuth, async (req, res) => {
  try {
    await connectDB()
    const entries = await JournalEntry.find({ userId: req.user.id }).sort({ date: -1 }).lean()
    return res.json(entries.map(fmt))
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, date } = req.body
    if (!title?.trim()) return res.status(422).json({ error: 'Title is required' })
    if (!date) return res.status(422).json({ error: 'Date is required' })
    await connectDB()
    const entry = await JournalEntry.create({ ...req.body, title: title.trim(), userId: req.user.id })
    return res.status(201).json(fmt(entry.toObject()))
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
})

router.get('/:id', requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID' })
    await connectDB()
    const entry = await JournalEntry.findOne({ _id: req.params.id, userId: req.user.id }).lean()
    if (!entry) return res.status(404).json({ error: 'Journal entry not found' })
    return res.json(fmt(entry))
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
})

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID' })
    await connectDB()
    const entry = await JournalEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean()
    if (!entry) return res.status(404).json({ error: 'Journal entry not found' })
    return res.json(fmt(entry))
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID' })
    await connectDB()
    const entry = await JournalEntry.findOneAndDelete({ _id: req.params.id, userId: req.user.id })
    if (!entry) return res.status(404).json({ error: 'Journal entry not found' })
    await Block.deleteMany({ entityId: req.params.id, entityType: 'JournalEntry' })
    return res.json({ message: 'Journal entry deleted' })
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
})

router.get('/:id/blocks', requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID' })
    await connectDB()
    const entry = await JournalEntry.findOne({ _id: req.params.id, userId: req.user.id }).lean()
    if (!entry) return res.status(404).json({ error: 'Journal entry not found' })
    const blocks = await Block.find({ entityId: req.params.id, entityType: 'JournalEntry' }).sort({ order: 1 }).lean()
    return res.json(blocks.map(b => ({ ...b, id: b._id.toString(), _id: undefined })))
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
})

module.exports = router
