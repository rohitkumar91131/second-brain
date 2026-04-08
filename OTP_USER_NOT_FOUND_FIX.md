# OTP "User Not Found" - Root Cause & Fix

## Problem You Were Having

```
Request received
[OTP VERIFY] Email: rk34190100@gmail.com OTP: 648618 DeviceID: 6d5bbfa7-7917-47eb-b4a5-84a41378ebc1
[OTP VERIFY] OTP record found: 69d627310df86b7e5beeadef
[OTP VERIFY] Checking OTP expiry...
[OTP VERIFY] OTP is valid (not expired)
[OTP VERIFY] OTP verified. Looking up user: 699627a269c78b24b0105005
[OTP VERIFY] User not found by ID (699627a269c78b24b0105005), trying email fallback...
[OTP VERIFY] User not found for email: rk34190100@gmail.com
```

**APK Error:** `"user not found - please register first"`

---

## Root Cause Identified

### The Issue:
1. **You logged in via Google/Facebook/GitHub** → NextAuth created a session
2. **NextAuth adapter creates User in native MongoDB** → Not in Mongoose User collection
3. **OTP generation stores incorrect userId** → Points to NextAuth's user ID
4. **Backend tries to find user** → Fails because Mongoose User collection is empty
5. **OTP verification fails** → User not found error

### Why It Happened:
- `lib/models/User.js` and `backend/models/User.js` are Mongoose models
- NextAuth's MongoDBAdapter uses native MongoDB driver, not Mongoose
- **Two different collections or schemas** → Data incompatibility

---

## Fix Applied (Commit: ec5acc2)

### 1. **NextAuth User Sync** ✅
**File:** `app/api/auth/[...nextauth]/route.js`

Added `signIn` callback that:
```javascript
// When user logs in via OAuth (Google, Facebook, GitHub)
if (account?.type === 'oauth' && user?.id) {
    // Create User document in Mongoose User collection
    await User.create({
        _id: user.id,           // Use NextAuth's user ID
        name: user.name,
        email: user.email,
        image: user.image,
        provider: account.provider,
        emailVerified: new Date(),
    })
}
```

**Result:** User automatically created in MongoDB when they login

### 2. **Enhanced OTP Generation** ✅
**File:** `app/api/device/otp/route.js`

Now:
- Verifies user exists in Mongoose User collection
- Falls back to email if ID lookup fails
- Logs which user ID is being stored in OTP record
- Better error messages for debugging

### 3. **Better Logging for Debugging** ✅
**File:** `backend/routes/auth.js`

OTP verification now shows:
```
[OTP VERIFY] OTP record - userId: 699627a269c78b24b0105005 userEmail: rk34190100@gmail.com
[OTP VERIFY] User lookup result: Found (rk34190100@gmail.com)
```

---

## How to Verify It's Fixed

### Step 1: Clear Your Data
Since existing users might have been created incorrectly, start fresh:

```bash
# Option A: In MongoDB/Mongosh
use second-brain
db.users.deleteMany({})
db.deviceotps.deleteMany({})
db.devices.deleteMany({})

# Option B: Using mongoose (in backend terminal)
npm run dev  # This will show all operations in console
```

### Step 2: Test the Flow

#### A. Login via Google/Facebook
1. Go to: `http://localhost:3000/login`
2. Click "Sign in with Google" or "Sign in with Facebook"
3. Complete authentication

**Console Should Show:**
```
[NEXTAUTH SIGNIN] User: rk34190100@gmail.com Provider: google
[NEXTAUTH SIGNIN] Syncing user to MongoDB...
[NEXTAUTH SIGNIN] Creating user in Mongoose: rk34190100@gmail.com
[NEXTAUTH SIGNIN] User created in MongoDB: rk34190100@gmail.com
```

#### B. Generate OTP
1. Go to: `http://localhost:3000/dashboard/connect/otp`
2. Click "Generate OTP"

**Console Should Show:**
```
[OTP GENERATE] Session user: rk34190100@gmail.com
[OTP GENERATE] Looking up user by ID: [user_id]
[OTP GENERATE] User verified: [user_id] rk34190100@gmail.com
[OTP GENERATE] Creating OTP record...
[OTP GENERATE] OTP created: 123456 User ID: [user_id]
```

#### C. Verify OTP in APK
1. APK: Open "Connect with OTP"
2. Enter email: `rk34190100@gmail.com`
3. Enter OTP: `123456` (from website)
4. Click "Connect"

**Backend Console Should Show:**
```
[OTP VERIFY] Email: rk34190100@gmail.com OTP: 123456
[OTP VERIFY] OTP record found: [record_id]
[OTP VERIFY] OTP is valid (not expired)
[OTP VERIFY] OTP verified. Looking up user: [user_id]
[OTP VERIFY] User lookup result: Found (rk34190100@gmail.com)
[OTP VERIFY] User verified: [user_id] (rk34190100@gmail.com)
[OTP VERIFY] OTP verification successful for user: rk34190100@gmail.com
```

**APK Should Show:**
✅ Connected successfully with user email

---

## Troubleshooting

### Issue: Still getting "User not found"

**Cause 1: Old User Data**
- Solution: Clear MongoDB collections and login again
```bash
db.users.deleteMany({})
```

**Cause 2: NextAuth Session Mismatch**
- Solution: Clear browser cookies
```bash
# Clear cookies in browser DevTools
# Application → Cookies → localhost:3000 → Delete all
```

**Cause 3: MongoDB Connection Issues**
- Check console for: `[OTP GENERATE] Database connected` ✅
- If missing, MongoDB is not connected

### Issue: User created but OTP generation still fails

**Check These Logs:**
```
[OTP GENERATE] Looking up user by ID: [user_id]
```

If it shows "User not found by ID", check:
1. User ID in NextAuth session matches MongoDB
2. User document was actually created in MongoDB
3. Run: `db.users.findOne({email: "rk34190100@gmail.com"})` in MongoDB shell

---

## Console Log Reference

### OTP Generation Flow
```
[OTP GENERATE] Request received
[OTP GENERATE] Session user: rk34190100@gmail.com
[OTP GENERATE] Connecting to database...
[OTP GENERATE] Database connected
[OTP GENERATE] Looking up user by ID: 699627a269c78b24b0105005
[OTP GENERATE] User verified: 699627a269c78b24b0105005 rk34190100@gmail.com
[OTP GENERATE] Creating OTP record...
[OTP GENERATE] OTP created: 648618 User ID: 699627a269c78b24b0105005
```

### OTP Verification Flow
```
[OTP VERIFY] Request received
[OTP VERIFY] Email: rk34190100@gmail.com OTP: 648618
[OTP VERIFY] Connecting to database...
[OTP VERIFY] Database connected
[OTP VERIFY] Looking up OTP record for email: rk34190100@gmail.com OTP: 648618
[OTP VERIFY] OTP record found: 69d627310df86b7e5beeadef
[OTP VERIFY] OTP record - userId: 699627a269c78b24b0105005 userEmail: rk34190100@gmail.com
[OTP VERIFY] Checking OTP expiry...
[OTP VERIFY] OTP is valid (not expired)
[OTP VERIFY] OTP verified. Looking up user: 699627a269c78b24b0105005
[OTP VERIFY] User lookup result: Found (rk34190100@gmail.com)
[OTP VERIFY] User verified: 699627a269c78b24b0105005 (rk34190100@gmail.com)
[OTP VERIFY] OTP verification successful for user: rk34190100@gmail.com
```

---

## What Changed in Git

**Commit:** `ec5acc2` - Fix: Sync users from NextAuth to MongoDB

**Files Modified:**
1. `app/api/auth/[...nextauth]/route.js` → Added user sync in signIn callback
2. `app/api/device/otp/route.js` → Enhanced logging and fallback lookup
3. `backend/routes/auth.js` → Better OTP verification logging

**Pull Latest:**
```bash
git pull origin master
```

---

## Testing Checklist

- [ ] Clear MongoDB data
- [ ] Clear browser cookies
- [ ] Login with Google/Facebook
- [ ] Verify console shows: `User created in MongoDB`
- [ ] Generate OTP on website
- [ ] Enter OTP in APK
- [ ] Verify APK connects successfully
- [ ] Check console for all `[OTP VERIFY]` logs showing "Found"

---

## Still Facing Issues?

1. **Share backend console logs** showing the exact error
2. **Check MongoDB** for user document:
   ```bash
   mongosh second-brain
   db.users.find({}).pretty()
   ```
3. **Verify URLs are correct:**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`
   - MongoDB: `mongodb://localhost:27017/second-brain`

