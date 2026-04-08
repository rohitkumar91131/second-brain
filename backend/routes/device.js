const express = require('express')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit')
const connectDB = require('../db')
const Device = require('../models/Device')
const DeviceVerification = require('../models/DeviceVerification')
const User = require('../models/User')
const { requireAuth } = require('../middleware/auth')
const mongoose = require('mongoose')

const router = express.Router()

// Rate limiters for unauthenticated device verification endpoints
const initiateRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many verification requests, please try again later' },
})

const verifyStatusRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 2 polls/sec max — enough for the 1s polling interval
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many status checks, please slow down' },
})

// GET /api/device — list devices
router.get('/', requireAuth, async (req, res) => {
  try {
    await connectDB()
    const devices = await Device.find({ userId: req.user.id, isActive: true }).sort({ lastSeen: -1 }).lean()
    return res.json(devices.map(d => ({ ...d, id: d._id.toString(), _id: undefined })))
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
})

// POST /api/device/verify/initiate — create a browser-based verification request (no auth required)
router.post('/verify/initiate', initiateRateLimit, async (req, res) => {
  try {
    console.log('[DEVICE INITIATE] Request received')
    const { deviceName, platform, deviceId, fcmToken } = req.body
    console.log('[DEVICE INITIATE] Device:', { deviceName, platform, deviceId })
    
    if (!deviceName || !deviceId) {
      console.log('[DEVICE INITIATE] Missing deviceName or deviceId')
      return res.status(400).json({ error: 'deviceName and deviceId are required' })
    }

    console.log('[DEVICE INITIATE] Connecting to database...')
    await connectDB()
    console.log('[DEVICE INITIATE] Database connected')

    const requestId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    console.log('[DEVICE INITIATE] Creating verification record...')
    const verification = await DeviceVerification.create({
      requestId,
      deviceName,
      platform: platform || 'unknown',
      deviceId,
      fcmToken: fcmToken || null,
      expiresAt,
    })
    console.log('[DEVICE INITIATE] Verification record created:', requestId)

    const webAppUrl = process.env.WEB_APP_URL
    if (!webAppUrl) {
      console.error('[DEVICE INITIATE] WEB_APP_URL environment variable is not set')
      return res.status(500).json({ error: 'WEB_APP_URL environment variable is not configured' })
    }
    const verificationUrl = `${webAppUrl}/dashboard/device/adddevice?requestId=${requestId}`
    console.log('[DEVICE INITIATE] Verification URL generated:', verificationUrl)

    console.log('[DEVICE INITIATE] Initiate successful')
    return res.status(201).json({ requestId, verificationUrl, expiresIn: 300 })
  } catch (e) {
    console.error('[DEVICE INITIATE] Error:', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/device/verify/:requestId — check browser verification status (no auth required)
// Returns accessToken + user when the web user has approved the request
router.get('/verify/:requestId', verifyStatusRateLimit, async (req, res) => {
  try {
    const { requestId } = req.params
    console.log('[DEVICE STATUS CHECK] Request ID:', requestId)
    if (!requestId) {
      console.log('[DEVICE STATUS CHECK] Missing request ID')
      return res.status(400).json({ error: 'Request ID required' })
    }

    console.log('[DEVICE STATUS CHECK] Connecting to database...')
    await connectDB()
    console.log('[DEVICE STATUS CHECK] Database connected')

    console.log('[DEVICE STATUS CHECK] Looking up verification record...')
    const verification = await DeviceVerification.findOne({ requestId })
    if (!verification) {
      console.error(`[DEVICE STATUS CHECK] Verification not found: ${requestId}`)
      return res.status(404).json({ error: 'Verification request not found' })
    }
    console.log('[DEVICE STATUS CHECK] Verification record found. Status:', verification.status)

    console.log('[DEVICE STATUS CHECK] Checking expiry...')
    if (new Date() > verification.expiresAt) {
      console.log('[DEVICE STATUS CHECK] Request expired')
      await DeviceVerification.updateOne({ requestId }, { status: 'expired' })
      return res.json({ status: 'expired' })
    }
    console.log('[DEVICE STATUS CHECK] Request still valid')

    if (verification.status === 'approved' && verification.userId) {
      console.log('[DEVICE STATUS CHECK] Request is approved. Looking up user:', verification.userId)
      const user = await User.findById(verification.userId).select('_id email name image')
      if (!user) {
        console.error(`[DEVICE STATUS CHECK] User not found: ${verification.userId}`)
        return res.status(404).json({ error: 'User not found' })
      }
      console.log('[DEVICE STATUS CHECK] User found:', user.email)

      const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET
      if (!secret) {
        console.error('[DEVICE STATUS CHECK] No JWT secret configured')
        return res.status(500).json({ error: 'Server configuration error' })
      }

      console.log('[DEVICE STATUS CHECK] Generating access token...')
      const accessToken = jwt.sign(
        { id: user._id.toString(), email: user.email, name: user.name, provider: 'device', deviceId: verification.deviceId },
        secret,
        { expiresIn: '30d' }
      )
      console.log('[DEVICE STATUS CHECK] Access token generated. Sending response...')

      return res.json({
        status: 'approved',
        accessToken,
        user: { id: user._id.toString(), name: user.name, email: user.email, image: user.image || null },
      })
    }

    console.log('[DEVICE STATUS CHECK] Current status:', verification.status)
    return res.json({ status: verification.status })
  } catch (e) {
    console.error('[DEVICE STATUS CHECK] Error:', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
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
