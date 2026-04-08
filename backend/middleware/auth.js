const jwt = require('jsonwebtoken')
const connectDB = require('../db')
const User = require('../models/User')

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) {
    console.log('[AUTH] No Bearer token in Authorization header')
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const token = authHeader.slice(7)
  try {
    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET
    if (!secret) {
      console.error('[AUTH] No JWT secret configured')
      return res.status(500).json({ error: 'Server configuration error' })
    }
    
    console.log('[AUTH] Verifying JWT token...')
    const payload = jwt.verify(token, secret)
    console.log('[AUTH] JWT verified. Email:', payload.email, 'ID from token:', payload.id)
    
    // CRITICAL FIX: Verify user exists in DB and use consistent user ID
    await connectDB()
    
    // Try to find user by ID from token first
    let user = await User.findById(payload.id).select('_id email name image').lean()
    
    if (!user) {
      // Fallback: Find by email (handles ID mismatch after NextAuth sync)
      console.log('[AUTH] User not found by ID, trying email fallback:', payload.email)
      user = await User.findOne({ email: payload.email }).select('_id email name image').lean()
      
      if (!user) {
        console.error('[AUTH] User not found in database:', payload.email)
        return res.status(401).json({ error: 'User not found - please log in again' })
      }
      console.log('[AUTH] User found by email fallback. Using ID:', user._id)
    } else {
      console.log('[AUTH] User verified by ID:', user._id)
    }
    
    // Use the actual database ID (not the token ID) to ensure consistency
    req.user = {
      id: user._id.toString(),  // Always use the MongoDB _id
      email: user.email,
      name: user.name,
      image: user.image || null,
    }
    console.log('[AUTH] User authenticated:', req.user.email)
    next()
  } catch (error) {
    console.error('[AUTH] Token verification error:', error.message)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

module.exports = { requireAuth }
