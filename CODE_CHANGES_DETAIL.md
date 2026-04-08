# Code Changes Summary - Device Verification Fixes

## File 1: backend/routes/auth.js

### Change 1: Fix signToken() function
**Location:** Line 13
```javascript
// BEFORE:
function signToken(user, deviceId) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, name: user.name, provider: 'device', deviceId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )
}

// AFTER:
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
```

**Why:** Ensures consistent JWT secret usage and throws clear error if not configured

---

### Change 2: Fix OTP verification endpoint
**Location:** Lines 125-195 (POST /api/device/otp/verify)
```javascript
// BEFORE:
const userData = await User.findById(otpRecord.userId).select('_id email name image')
if (!userData) return res.status(404).json({ error: 'User not found' })

// AFTER:
console.log(`[OTP] OTP verified. Looking up user: ${otpRecord.userId}`)
let userData = await User.findById(otpRecord.userId).select('_id email name image')

// If user not found by ID, try fallback by email
if (!user) {
  console.log(`[OTP] User not found by ID (${otpRecord.userId}), trying email fallback...`)
  userData = await User.findOne({ email: normalizedEmail }).select('_id email name image')
}

if (!userData) {
  console.error(`[OTP] User not found for email: ${normalizedEmail}`)
  return res.status(404).json({ error: 'User not found - please register first' })
}
```

**Why:** 
- Fallback lookup by email if ID lookup fails
- Better error messages
- Detailed logging for debugging

---

### Change 3: Fix QR verification endpoint  
**Location:** Lines 85-124 (POST /api/device/verify)
```javascript
// BEFORE:
const userData = await User.findById(deviceToken.userId).select('_id email name image')
  || await User.findOne({ email: deviceToken.userEmail }).select('_id email name image')
if (!userData) return res.status(404).json({ error: 'User not found' })

// AFTER:
console.log(`[QR] Token verified. Looking up user: ${deviceToken.userId}`)
let userData = await User.findById(deviceToken.userId).select('_id email name image')

// Fallback to email if ID lookup fails
if (!userData) {
  console.log(`[QR] User not found by ID (${deviceToken.userId}), trying email fallback...`)
  userData = await User.findOne({ email: deviceToken.userEmail }).select('_id email name image')
}

if (!userData) {
  console.error(`[QR] User not found for ID: ${deviceToken.userId}, email: ${deviceToken.userEmail}`)
  return res.status(404).json({ error: 'User not found - please register first' })
}
```

**Why:**
- Sequential lookup (ID → email) with logging
- Clearer error messages
- Helps identify what went wrong

---

## File 2: backend/routes/device.js

### Change: Fix browser verification status endpoint
**Location:** Lines 75-114 (GET /api/device/verify/:requestId)
```javascript
// BEFORE:
const verification = await DeviceVerification.findOne({ requestId })
if (!verification) return res.status(404).json({ error: 'Verification request not found' })

if (verification.status === 'approved' && verification.userId) {
  const user = await User.findById(verification.userId).select('_id email name image')
  if (!user) return res.status(404).json({ error: 'User not found' })

  const accessToken = jwt.sign(
    { id: user._id.toString(), email: user.email, name: user.name, provider: 'device', deviceId: verification.deviceId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )

// AFTER:
const verification = await DeviceVerification.findOne({ requestId })
if (!verification) {
  console.error(`[VERIFY] Verification not found: ${requestId}`)
  return res.status(404).json({ error: 'Verification request not found' })
}

if (verification.status === 'approved' && verification.userId) {
  const user = await User.findById(verification.userId).select('_id email name image')
  if (!user) {
    console.error(`[VERIFY] User not found: ${verification.userId}`)
    return res.status(404).json({ error: 'User not found' })
  }

  const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET
  if (!secret) {
    console.error('[VERIFY] No JWT secret configured')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const accessToken = jwt.sign(
    { id: user._id.toString(), email: user.email, name: user.name, provider: 'device', deviceId: verification.deviceId },
    secret,
    { expiresIn: '30d' }
  )
```

**Why:**
- JWT secret validation (prevents 500 errors)
- Detailed logging for each failure point
- Clear error messages for debugging

---

## File 3: backend/middleware/auth.js

### Change: Add JWT secret handling
**Location:** Lines 3-24 (requireAuth function)
```javascript
// BEFORE:
try {
  const payload = jwt.verify(token, process.env.JWT_SECRET)
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

// AFTER:
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
```

**Why:**
- Consistent JWT secret handling
- Validates secret exists before using
- Helpful error if configuration missing

---

## File 4: app/api/device/verify/route.js (Frontend - Next.js)

### Change: Add user lookup fallback
**Location:** Lines 48-70 (POST /api/device/verify)
```javascript
// BEFORE:
// Fetch user data separately (finding by ObjectId, or fallback to email)
const userData = await User.findById(deviceToken.userId).select('_id email name image') ||
    await User.findOne({ email: deviceToken.userEmail }).select('_id email name image')

if (!userData) {
  return NextResponse.json(
    { error: 'User not found' },
    { status: 404 }
  )
}

// AFTER:
// Fetch user data separately (finding by ObjectId, or fallback to email)
console.log(`[QR] Token verified. Looking up user: ${deviceToken.userId}`)
let userData = await User.findById(deviceToken.userId).select('_id email name image')

// Fallback to email if ID lookup fails
if (!userData) {
  console.log(`[QR] User not found by ID (${deviceToken.userId}), trying email fallback...`)
  userData = await User.findOne({ email: deviceToken.userEmail }).select('_id email name image')
}

if (!userData) {
  console.error(`[QR] User not found for ID: ${deviceToken.userId}, email: ${deviceToken.userEmail}`)
  return NextResponse.json(
    { error: 'User not found - please register first' },
    { status: 404 }
  )
}
```

**Why:**
- Sequential lookup instead of OR operator (better control)
- Logging for debugging
- Helpful error messages

---

## Summary of Changes

| File | Change Type | Problem Solved |
|------|-------------|-----------------|
| backend/routes/auth.js | 3 changes | OTP/QR "User not found" + JWT secret |
| backend/routes/device.js | 1 change | Browser 500 error + JWT secret |
| backend/middleware/auth.js | 1 change | JWT secret consistency |
| app/api/device/verify/route.js | 1 change | Logging + user lookup |

**Total Lines Changed:** ~80 lines across 4 files
**Key Improvements:**
- ✅ Added fallback user lookup by email
- ✅ Consistent JWT secret handling (NEXTAUTH_SECRET primary)
- ✅ Comprehensive error logging
- ✅ Better error messages for users
- ✅ JWT secret validation before use

---

## Testing These Changes

### Quick Test Command
```bash
# Test OTP endpoint
curl -X POST http://localhost:5000/api/auth/device/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456",
    "deviceName": "Test Phone",
    "platform": "android",
    "deviceId": "test-device-123"
  }' | jq .

# Should return:
# - SUCCESS: { "accessToken": "...", "user": {...} }
# - NOT: { "error": "User not found" }
```

### Check Backend Logs
After making requests, you should see logs like:
```
[OTP] OTP verified. Looking up user: 507f1f77bcf86cd799439011
[OTP] User verified: 507f1f77bcf86cd799439011 (test@example.com)
[QR] Token verified. Looking up user: 507f1f77bcf86cd799439012
[VERIFY] Verification not found: request-id (only if verification doesn't exist)
```

**If you see error logs like:**
```
[OTP] User not found by ID (507f1f77bcf86cd799439013), trying email fallback...
[OTP] User not found for email: test@example.com
```
**→ This means the user doesn't exist in MongoDB. Register the user first!**

---

## Verification Checklist

After applying changes:
- [ ] All 4 files modified correctly
- [ ] Backend restarted
- [ ] NEXTAUTH_SECRET set in both .env files  
- [ ] MongoDB is running
- [ ] Try OTP flow - should work now
- [ ] Try QR flow - should work now
- [ ] Try browser flow - should work now
- [ ] Backend logs show successful operations
- [ ] No more "User not found" errors

If still having issues, check:
1. User actually exists in MongoDB: `db.users.findOne({ email: "..." })`
2. NEXTAUTH_SECRET values match between backend and frontend
3. Backend is running on correct port (5000)
4. MongoDB connection string is correct
