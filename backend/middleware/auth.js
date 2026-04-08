const jwt = require('jsonwebtoken')

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const token = authHeader.slice(7)
  try {
    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET
    if (!secret) {
      console.error('[AUTH] No JWT secret configured')
      return res.status(500).json({ error: 'Server configuration error' })
    }
    const payload = jwt.verify(token, secret)
    req.user = {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      image: payload.image || null,
    }
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

module.exports = { requireAuth }
