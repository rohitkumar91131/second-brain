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
  const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET or NEXTAUTH_SECRET not configured')
  }
  return jwt.sign(
    { id: user._id.toString(), email: user.email, name: user.name, provider: 'device', deviceId },
    secret,
    { expiresIn: '30d' }
  )
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    console.log('[LOGIN] Request received')
    const { email, password } = req.body
    console.log('[LOGIN] Email:', email)
    if (!email || !password) {
      console.log('[LOGIN] Missing email or password')
      return res.status(400).json({ error: 'Email and password are required' })
    }

    console.log('[LOGIN] Connecting to database...')
    await connectDB()
    console.log('[LOGIN] Database connected')
    
    const normalizedEmail = email.toLowerCase().trim()
    console.log('[LOGIN] Looking up user with email:', normalizedEmail)
    const user = await User.findOne({ email: normalizedEmail }).select('+password')
    
    if (!user) {
      console.log('[LOGIN] User not found:', normalizedEmail)
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    if (!user.password) {
      console.log('[LOGIN] User has no password set:', normalizedEmail)
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    console.log('[LOGIN] Comparing passwords...')
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      console.log('[LOGIN] Password mismatch for:', normalizedEmail)
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    console.log('[LOGIN] Password valid. Generating token for user:', user._id)
    const accessToken = jwt.sign(
      { id: user._id.toString(), email: user.email, name: user.name, provider: 'credentials' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    console.log('[LOGIN] Login successful for:', user.email)
    return res.json({
      accessToken,
      user: { id: user._id.toString(), name: user.name, email: user.email, image: user.image || null },
    })
  } catch (e) {
    console.error('[LOGIN] Error:', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    console.log('[REGISTER] Request received')
    const { name, email, password } = req.body
    console.log('[REGISTER] Email:', email, 'Name:', name)
    
    if (!name || !email || !password) {
      console.log('[REGISTER] Missing required fields')
      return res.status(400).json({ error: 'Name, email, and password are required' })
    }
    
    if (password.length < 8) {
      console.log('[REGISTER] Password too short')
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }

    console.log('[REGISTER] Connecting to database...')
    await connectDB()
    console.log('[REGISTER] Database connected')
    
    const normalizedEmail = email.toLowerCase().trim()
    console.log('[REGISTER] Checking if email already exists:', normalizedEmail)
    const existing = await User.findOne({ email: normalizedEmail })
    
    if (existing) {
      console.log('[REGISTER] Email already registered:', normalizedEmail)
      return res.status(409).json({ error: 'Email already registered' })
    }

    console.log('[REGISTER] Hashing password...')
    const hashed = await bcrypt.hash(password, 12)
    console.log('[REGISTER] Creating user...')
    const user = await User.create({ 
      name: name.trim(), 
      email: normalizedEmail, 
      password: hashed 
    })
    
    console.log('[REGISTER] User created:', user._id, user.email)

    console.log('[REGISTER] Generating access token...')
    const accessToken = jwt.sign(
      { id: user._id.toString(), email: user.email, name: user.name, provider: 'credentials' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    console.log('[REGISTER] Registration successful for:', user.email)
    return res.status(201).json({
      accessToken,
      user: { id: user._id.toString(), name: user.name, email: user.email, image: null },
    })
  } catch (e) {
    console.error('[REGISTER] Error:', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/device/verify  — QR-code device connect (token from website QR code)
router.post('/device/verify', async (req, res) => {
  try {
    console.log('[QR VERIFY] Request received')
    const { token, deviceName, platform, deviceId, fcmToken } = req.body
    console.log('[QR VERIFY] DeviceID:', deviceId, 'Platform:', platform)
    if (!token || !deviceId) {
      console.log('[QR VERIFY] Missing token or deviceId')
      return res.status(400).json({ error: 'token and deviceId are required' })
    }

    console.log('[QR VERIFY] Connecting to database...')
    await connectDB()
    console.log('[QR VERIFY] Database connected')
    
    console.log('[QR VERIFY] Looking up token:', token.substring(0, 20) + '...')
    const deviceToken = await DeviceToken.findOne({ token, isUsed: false })
    if (!deviceToken) {
      console.error(`[QR VERIFY] Token not found or already used: ${token.substring(0, 20)}...`)
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
    console.log('[QR VERIFY] Token found. Checking expiry...')
    
    if (Date.now() > new Date(deviceToken.expiresAt).getTime()) {
      console.error(`[QR VERIFY] Token expired: ${token.substring(0, 20)}...`)
      return res.status(401).json({ error: 'Token has expired' })
    }

    console.log(`[QR VERIFY] Token valid. Looking up user: ${deviceToken.userId}`)
    let userData = await User.findById(deviceToken.userId).select('_id email name image')
    
    // Fallback to email if ID lookup fails
    if (!userData) {
      console.log(`[QR VERIFY] User not found by ID (${deviceToken.userId}), trying email fallback...`)
      userData = await User.findOne({ email: deviceToken.userEmail }).select('_id email name image')
    }
    
    if (!userData) {
      console.error(`[QR VERIFY] User not found for ID: ${deviceToken.userId}, email: ${deviceToken.userEmail}`)
      return res.status(404).json({ error: 'User not found - please register first' })
    }

    console.log(`[QR VERIFY] User verified: ${userData._id} (${userData.email})`)
    console.log('[QR VERIFY] Marking token as used...')
    await DeviceToken.findByIdAndUpdate(deviceToken._id, { isUsed: true })
    console.log('[QR VERIFY] Token marked as used')

    console.log('[QR VERIFY] Creating/updating device...')
    const device = await Device.findOneAndUpdate(
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
    console.log('[QR VERIFY] Device created/updated:', device._id)

    console.log('[QR VERIFY] Generating access token...')
    const accessToken = signToken(userData, deviceId)

    console.log('[QR VERIFY] QR verification successful for user:', userData.email)
    return res.json({
      accessToken,
      user: { id: userData._id.toString(), name: userData.name, email: userData.email, image: userData.image || null },
    })
  } catch (e) {
    console.error('[QR VERIFY] Error:', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/device/otp/verify  — OTP-based device connect
// APK sends: { email, otp, deviceName, platform, deviceId }
router.post('/device/otp/verify', async (req, res) => {
  try {
    console.log('[OTP VERIFY] Request received')
    const { email, otp, deviceName, platform, deviceId, fcmToken } = req.body
    console.log('[OTP VERIFY] Email:', email, 'OTP:', otp, 'DeviceID:', deviceId)
    
    if (!email || !otp || !deviceId) {
      console.log('[OTP VERIFY] Missing email, otp, or deviceId')
      return res.status(400).json({ error: 'email, otp, and deviceId are required' })
    }
    
    if (!/^\d{6}$/.test(otp)) {
      console.log('[OTP VERIFY] Invalid OTP format:', otp)
      return res.status(400).json({ error: 'OTP must be 6 digits' })
    }

    console.log('[OTP VERIFY] Connecting to database...')
    await connectDB()
    console.log('[OTP VERIFY] Database connected')

    const normalizedEmail = email.toLowerCase().trim()
    console.log('[OTP VERIFY] Looking up OTP record for email:', normalizedEmail, 'OTP:', otp)
    const otpRecord = await DeviceOtp.findOne({ userEmail: normalizedEmail, otp, isUsed: false })
    
    if (!otpRecord) {
      console.error(`[OTP VERIFY] OTP not found for email: ${normalizedEmail}, otp: ${otp}`)
      return res.status(401).json({ error: 'Invalid OTP' })
    }
    console.log('[OTP VERIFY] OTP record found:', otpRecord._id)
    console.log('[OTP VERIFY] OTP record - userId:', otpRecord.userId, 'userEmail:', otpRecord.userEmail)
    
    console.log('[OTP VERIFY] Checking OTP expiry...')
    if (Date.now() > new Date(otpRecord.expiresAt).getTime()) {
      console.error(`[OTP VERIFY] OTP expired for ${normalizedEmail}`)
      return res.status(401).json({ error: 'OTP has expired' })
    }
    console.log('[OTP VERIFY] OTP is valid (not expired)')

    console.log(`[OTP VERIFY] OTP verified. Looking up user: ${otpRecord.userId}`)
    const userData = await User.findById(otpRecord.userId).select('_id email name image')
    console.log('[OTP VERIFY] User lookup result:', userData ? `Found (${userData.email})` : 'NOT FOUND')
    
    // If user not found by ID, try fallback by email
    let user = userData
    if (!user) {
      console.log(`[OTP VERIFY] User not found by ID (${otpRecord.userId}), trying email fallback...`)
      user = await User.findOne({ email: normalizedEmail }).select('_id email name image')
    }
    
    if (!user) {
      console.error(`[OTP VERIFY] User not found for email: ${normalizedEmail}`)
      return res.status(404).json({ error: 'User not found - please register first' })
    }

    console.log(`[OTP VERIFY] User verified: ${user._id} (${user.email})`)
    console.log('[OTP VERIFY] Marking OTP as used...')
    await DeviceOtp.findByIdAndUpdate(otpRecord._id, { isUsed: true })
    console.log('[OTP VERIFY] OTP marked as used')

    console.log('[OTP VERIFY] Creating/updating device...')
    const device = await Device.findOneAndUpdate(
      { deviceId },
      {
        userId: user._id,
        name: deviceName || 'My Phone',
        platform: platform || 'unknown',
        fcmToken: fcmToken || null,
        lastSeen: new Date(),
        isActive: true,
      },
      { upsert: true, new: true }
    )
    console.log('[OTP VERIFY] Device created/updated:', device._id)

    console.log('[OTP VERIFY] Generating access token...')
    const accessToken = signToken(user, deviceId)

    console.log('[OTP VERIFY] OTP verification successful for user:', user.email)
    return res.json({
      accessToken,
      user: { id: user._id.toString(), name: user.name, email: user.email, image: user.image || null },
    })
  } catch (e) {
    console.error('[OTP VERIFY] Error:', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
