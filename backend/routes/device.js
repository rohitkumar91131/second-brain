const express = require('express')
const connectDB = require('../db')
const Device = require('../models/Device')
const { requireAuth } = require('../middleware/auth')
const mongoose = require('mongoose')

const router = express.Router()

// GET /api/device — list devices
router.get('/', requireAuth, async (req, res) => {
  try {
    await connectDB()
    const devices = await Device.find({ userId: req.user.id, isActive: true }).sort({ lastSeen: -1 }).lean()
    return res.json(devices.map(d => ({ ...d, id: d._id.toString(), _id: undefined })))
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
})

// DELETE /api/device/:id — remove device
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID' })
    await connectDB()
    const device = await Device.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isActive: false },
      { new: true }
    )
    if (!device) return res.status(404).json({ error: 'Device not found' })
    return res.json({ message: 'Device removed' })
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
})

module.exports = router
