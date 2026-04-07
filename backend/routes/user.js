const express = require('express')
const connectDB = require('../db')
const User = require('../models/User')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

// GET /api/user/profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    await connectDB()
    const user = await User.findById(req.user.id).lean()
    if (!user) return res.status(404).json({ error: 'User not found' })
    return res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      provider: user.provider,
      viewPreferences: user.viewPreferences || {},
      createdAt: user.createdAt,
    })
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
})

// PATCH /api/user/profile
router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const { name, image, viewPreferences } = req.body
    const updates = {}
    if (name) updates.name = name.trim()
    if (image !== undefined) updates.image = image
    if (viewPreferences) updates.viewPreferences = viewPreferences

    await connectDB()
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean()
    if (!user) return res.status(404).json({ error: 'User not found' })
    return res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      viewPreferences: user.viewPreferences || {},
    })
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
})

module.exports = router
