const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const crypto = require('crypto')
const connectDB = require('../db')
const User = require('../models/User')
const Device = require('../models/Device')
const DeviceToken = require('../models/DeviceToken')
const DeviceOtp = require('../models/DeviceOtp')

const router = express.Router()

function signToken(user, deviceId) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, name: user.name, provider: 'device', deviceId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

    await connectDB()
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    if (!user.password) return res.status(401).json({ error: 'This account does not use password login. Please use QR or OTP.' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const accessToken = jwt.sign(
      { id: user._id.toString(), email: user.email, name: user.name, provider: 'credentials' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    return res.json({
      accessToken,
      user: { id: user._id.toString(), name: user.name, email: user.email, image: user.image || null },
    })
  } catch (e) {
    console.error('Login error:', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' })
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })

    await connectDB()
    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) return res.status(409).json({ error: 'Email already registered' })

    const hashed = await bcrypt.hash(password, 12)
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password: hashed })

    const accessToken = jwt.sign(
      { id: user._id.toString(), email: user.email, name: user.name, provider: 'credentials' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    return res.status(201).json({
      accessToken,
      user: { id: user._id.toString(), name: user.name, email: user.email, image: null },
    })
  } catch (e) {
    console.error('Register error:', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/device/verify  — QR-code device connect (token from website QR code)
router.post('/device/verify', async (req, res) => {
  try {
    const { token, deviceName, platform, deviceId, fcmToken } = req.body
    if (!token || !deviceId) return res.status(400).json({ error: 'token and deviceId are required' })

    await connectDB()
    const deviceToken = await DeviceToken.findOne({ token, isUsed: false })
    if (!deviceToken) return res.status(401).json({ error: 'Invalid or expired token' })
    if (Date.now() > new Date(deviceToken.expiresAt).getTime()) {
      return res.status(401).json({ error: 'Token has expired' })
    }

    const userData = await User.findById(deviceToken.userId).select('_id email name image')
      || await User.findOne({ email: deviceToken.userEmail }).select('_id email name image')
    if (!userData) return res.status(404).json({ error: 'User not found' })

    await DeviceToken.findByIdAndUpdate(deviceToken._id, { isUsed: true })

    await Device.findOneAndUpdate(
      { deviceId },
      {
        userId: userData._id,
        name: deviceName || 'My Phone',
        platform: platform || 'unknown',
        fcmToken: fcmToken || null,
        lastSeen: new Date(),
        isActive: true,
      },
      { upsert: true, new: true }
    )

    const accessToken = signToken(userData, deviceId)

    return res.json({
      accessToken,
      user: { id: userData._id.toString(), name: userData.name, email: userData.email, image: userData.image || null },
    })
  } catch (e) {
    console.error('QR verify error:', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/device/otp/verify  — OTP-based device connect
// APK sends: { email, otp, deviceName, platform, deviceId }
router.post('/device/otp/verify', async (req, res) => {
  try {
    const { email, otp, deviceName, platform, deviceId, fcmToken } = req.body
    if (!email || !otp || !deviceId) return res.status(400).json({ error: 'email, otp, and deviceId are required' })
    if (!/^\d{6}$/.test(otp)) return res.status(400).json({ error: 'OTP must be 6 digits' })

    await connectDB()

    const normalizedEmail = email.toLowerCase().trim()
    const otpRecord = await DeviceOtp.findOne({ userEmail: normalizedEmail, otp, isUsed: false })
    if (!otpRecord) return res.status(401).json({ error: 'Invalid OTP' })
    if (Date.now() > new Date(otpRecord.expiresAt).getTime()) {
      return res.status(401).json({ error: 'OTP has expired' })
    }

    const userData = await User.findById(otpRecord.userId).select('_id email name image')
    if (!userData) return res.status(404).json({ error: 'User not found' })

    await DeviceOtp.findByIdAndUpdate(otpRecord._id, { isUsed: true })

    await Device.findOneAndUpdate(
      { deviceId },
      {
        userId: userData._id,
        name: deviceName || 'My Phone',
        platform: platform || 'unknown',
        fcmToken: fcmToken || null,
        lastSeen: new Date(),
        isActive: true,
      },
      { upsert: true, new: true }
    )

    const accessToken = signToken(userData, deviceId)

    return res.json({
      accessToken,
      user: { id: userData._id.toString(), name: userData.name, email: userData.email, image: userData.image || null },
    })
  } catch (e) {
    console.error('OTP verify error:', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
