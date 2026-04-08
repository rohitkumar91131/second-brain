# Deployment Configuration Guide

## Issues Fixed in Production

### 1. Express Rate Limit X-Forwarded-For Error ✅

**Error:**
```
ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false
```

**Cause:**
- Backend is running behind a reverse proxy (Render, Heroku, etc.)
- Rate limiter receives X-Forwarded-For header but Express doesn't trust the proxy
- Results in validation error

**Fix Applied:**
```javascript
// backend/server.js
app.set('trust proxy', 1)  // Trust first proxy (the load balancer/reverse proxy)
```

**Enhanced Rate Limiting:**
```javascript
// backend/routes/device.js
keyGenerator: (req, res) => {
  const forwardedFor = req.get('X-Forwarded-For')
  const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : req.ip
  return clientIp
}
```

---

### 2. WEB_APP_URL Environment Variable Missing ✅

**Error:**
```
[DEVICE INITIATE] WEB_APP_URL environment variable is not set
```

**Cause:**
- Device verification endpoint needs to generate frontend URL for APK to open
- Environment variable not set on Render or deployment platform

**Fix Applied:**
```javascript
// backend/routes/device.js
const webAppUrl = process.env.WEB_APP_URL || process.env.FRONTEND_URL || 'https://secondbrain.rohits.online'
```

Fallback chain:
1. `WEB_APP_URL` (primary)
2. `FRONTEND_URL` (alternative)
3. `https://secondbrain.rohits.online` (hardcoded fallback)

---

## Environment Variables Checklist

### Backend (.env or Render Config)

```bash
# Database
MONGODB_URI=mongodb://...

# JWT / Auth
JWT_SECRET=your-secret-key-here
NEXTAUTH_SECRET=your-nextauth-secret

# Frontend URL (for device verification)
WEB_APP_URL=https://yourdomain.com
# OR
FRONTEND_URL=https://yourdomain.com

# Twilio (Optional - for SMS OTP)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=...

# Node Environment
NODE_ENV=production

# Server Port
PORT=5000
```

### Frontend (.env.local or Vercel Config)

```bash
# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-nextauth-secret

# Backend API
NEXT_PUBLIC_API_URL=https://your-backend-api.com

# OAuth (Google, Facebook, GitHub)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_CLIENT_ID=...
FACEBOOK_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# MongoDB
MONGODB_URI=mongodb://...
```

---

## Render Deployment Setup

### 1. Create Backend Service

**Environment Variables:**
```
MONGODB_URI = <your-mongodb-url>
JWT_SECRET = <random-secret-key>
NEXTAUTH_SECRET = <random-secret-key>
WEB_APP_URL = https://yourdomain.com
NODE_ENV = production
```

**Build Command:**
```bash
cd backend && npm install
```

**Start Command:**
```bash
cd backend && npm start
```

**Health Check Path:**
```
/health
```

### 2. Create Frontend Service (or use Vercel)

**Environment Variables:**
```
NEXTAUTH_URL = https://yourdomain.com
NEXTAUTH_SECRET = <same-as-backend>
NEXT_PUBLIC_API_URL = https://your-backend-service.onrender.com
MONGODB_URI = <your-mongodb-url>
```

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

---

## Testing Deployment

### Step 1: Verify Backend Health

```bash
curl https://your-backend-api.com/health

# Expected Response:
# {"status":"ok","timestamp":"2026-04-08T..."}
```

### Step 2: Test Device Initiation

```bash
curl -X POST https://your-backend-api.com/api/device/verify/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device-123",
    "deviceName": "Test Phone",
    "platform": "android"
  }'

# Expected Response:
# {
#   "requestId": "uuid-here",
#   "verificationUrl": "https://yourdomain.com/dashboard/device/adddevice?requestId=uuid-here",
#   "expiresIn": 300
# }
```

If you see: `"WEB_APP_URL environment variable is not set"`
→ Add WEB_APP_URL to your deployment config

### Step 3: Check Rate Limiting

```bash
# Make multiple requests (should hit rate limit after 10 in 15 minutes)
for i in {1..15}; do
  curl -X POST https://your-backend-api.com/api/device/verify/initiate \
    -H "Content-Type: application/json" \
    -d '{"deviceId":"test-'$i'","deviceName":"Test"}'
done

# Should see after 10th request:
# {"error":"Too many verification requests, please try again later"}
```

Backend console should show:
```
[RATE LIMIT] initiateRateLimit - IP: 1.2.3.4
[RATE LIMIT] Using IP: 1.2.3.4
```

---

## Common Deployment Issues

### Issue 1: Rate Limit Error in Production

**Symptom:**
```
ValidationError: The 'X-Forwarded-For' header is set but Express 'trust proxy' is false
```

**Solution:**
- Ensure `app.set('trust proxy', 1)` is in `backend/server.js`
- This is now automatically added in the latest code

**Check:**
```bash
grep "trust proxy" backend/server.js
```

### Issue 2: Device Verification URL Not Working

**Symptom:**
```
[DEVICE INITIATE] WEB_APP_URL environment variable is not set
```

**Solution:**
1. Set `WEB_APP_URL` in your deployment config
2. For Render: Add to Environment Variables
3. For Vercel: Add to Project Settings → Environment Variables (for backend if running there)

**Example Values:**
```
WEB_APP_URL=https://yourdomain.com
WEB_APP_URL=https://secondbrain.rohits.online
WEB_APP_URL=https://app.vercel.com
```

### Issue 3: CORS Errors in Production

**Solution:**
Add your production domain to ALLOWED_ORIGINS in `backend/server.js`:

```javascript
const ALLOWED_ORIGINS = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
  'http://localhost:3000',  // Development
]
```

### Issue 4: NextAuth Session Not Working

**Symptoms:**
- User gets logged out randomly
- "Unauthorized" errors when accessing protected routes

**Solutions:**
1. Ensure `NEXTAUTH_SECRET` is same on frontend and backend
2. Set `NEXTAUTH_URL` on frontend to match production domain
3. Check that database is accessible from both frontend and backend

**Verify:**
```bash
# Check if env vars are set
curl https://your-frontend.com/api/auth/session

# Should return user object if logged in, null otherwise
```

---

## Logs to Monitor

### Backend Console Logs

**Good Logs:**
```
[DEVICE INITIATE] Request received
[DEVICE INITIATE] Verification record created: uuid-here
[DEVICE INITIATE] Verification URL generated: https://yourdomain.com/dashboard/device/adddevice?requestId=uuid
[DEVICE INITIATE] Initiate successful
[RATE LIMIT] Using IP: 1.2.3.4
```

**Error Logs to Fix:**
```
[DEVICE INITIATE] WEB_APP_URL environment variable is not set
→ Solution: Add WEB_APP_URL to environment

ValidationError: The 'X-Forwarded-For' header is set but Express 'trust proxy' is false
→ Solution: Ensure app.set('trust proxy', 1) is in server.js
```

---

## Production Checklist

- [ ] `WEB_APP_URL` environment variable set
- [ ] `JWT_SECRET` and `NEXTAUTH_SECRET` configured
- [ ] `MONGODB_URI` pointing to production database
- [ ] `app.set('trust proxy', 1)` enabled in `backend/server.js`
- [ ] CORS ALLOWED_ORIGINS includes production domain
- [ ] Backend health check endpoint (`/health`) responding
- [ ] Rate limiting working (test with multiple requests)
- [ ] Device verification URL generates correctly
- [ ] Frontend can reach backend API
- [ ] OAuth credentials (Google, Facebook, GitHub) configured
- [ ] NEXTAUTH_SECRET is same on frontend and backend
- [ ] Database backups configured
- [ ] Logs being captured and monitored

---

## Git Changes

**Commit:** `[latest]` - Fix Express trust proxy and improve WEB_APP_URL handling

**Files Modified:**
1. `backend/server.js` - Added `app.set('trust proxy', 1)`
2. `backend/routes/device.js` - Enhanced rate limiting and WEB_APP_URL fallback

**Pull Latest:**
```bash
git pull origin master
cd backend && npm install
```

---

## Quick Deploy Steps

### 1. Push Latest Code
```bash
git pull origin master
git push origin master
```

### 2. Render Dashboard
- Go to https://dashboard.render.com
- Select your backend service
- Environment variables should auto-populate from .env
- If missing, add manually:
  - `WEB_APP_URL=https://yourdomain.com`
  - Other vars as needed

### 3. Verify Deployment
```bash
# Test health endpoint
curl https://your-backend.onrender.com/health

# Test device initiation
curl -X POST https://your-backend.onrender.com/api/device/verify/initiate \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"test","deviceName":"Test","platform":"android"}'
```

### 4. Check Backend Logs
- Render Dashboard → Your Service → Logs
- Look for `[DEVICE INITIATE]` logs confirming requests

---

## Still Having Issues?

1. **Check Render Logs:**
   - Dashboard → Service → Logs tab
   - Look for error messages and stack traces

2. **Verify Environment Variables:**
   ```bash
   # In Render dashboard, click on your service
   # Click Environment to see all variables
   # Ensure WEB_APP_URL is set
   ```

3. **Test API Directly:**
   ```bash
   # Use curl or Postman to test endpoints
   curl -v https://your-backend/api/device/verify/initiate
   ```

4. **Check Database Connection:**
   ```bash
   # In MongoDB Atlas or your DB provider
   # Verify the MONGODB_URI is correct
   # Check IP whitelist allows Render IPs
   ```

5. **Contact Support:**
   - Provide backend logs showing the error
   - List all environment variables (excluding secrets)
   - Share the curl command that's failing

