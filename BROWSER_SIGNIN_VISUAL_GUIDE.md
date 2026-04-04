# Browser Sign-In - Visual Guides

## 🖼️ User Journey Flowchart

```
┌─────────────────────────────────────────────────────────────────────┐
│                         START: Mobile App                            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │  Login Screen            │
                    │ ┌──────────────────────┐ │
                    │ │ Connect with QR ──┐  │ │
                    │ │ Sign In with... ──┤  │ │ ◄─────┐
                    │ │  ✓ Browser       ◄┘  │ │       │
                    │ └──────────────────────┘ │       │
                    └──────────────────────────┘       │
                                  │                    │
                                  ├─ Tap "Browser Sign In"
                                  │                    │
                                  ▼                    │
                    ┌──────────────────────────┐       │
                    │ Generate UUID            │       │
                    │ + device name/platform   │       │
                    └──────────────────────────┘       │
                                  │                    │
                                  ▼                    │
                    ┌──────────────────────────┐       │
                    │ POST /initiate           │       │
                    │ ✓ Create request         │       │
                    │ ✓ 5-min window           │       │
                    └──────────────────────────┘       │
                                  │                    │
                    ┌─────────────────────────────┐    │
                    │ requestId: "uuid..."        │    │
                    │ verificationUrl: "http://..." │  │
                    └─────────────────────────────┘    │
                                  │                    │
                                  ▼                    │
                    ┌──────────────────────────┐       │
                    │ OPEN BROWSER             │       │
                    │ verificationUrl auto-   │       │
                    │ opens in default browser │       │
                    └──────────────────────────┘       │
                                  │                    │
                ┌─────────────────┴──────────────────┐ │
                │                                    │  │
                ▼                                    ▼  │
    ┌──────────────────────┐          ┌──────────────────────────┐
    │ Polling Every 1 Sec  │          │   WEB BROWSER OPENS      │
    │ GET /verify/[id]     │          │ /dashboard/device/..     │
    │ status: pending      │          └──────────────────────────┘
    │ status: pending      │                      │
    │ status: pending      │          ┌───────────┴────────────┐
    └──────────────────────┘          │                        │
                │                     ▼                        ▼
                │            ┌─────────────────┐     ┌─────────────────┐
                │            │ Logged In?      │     │ Not Logged In?  │
                │            │ YES             │     │ NO              │
                │            └─────────────────┘     └─────────────────┘
                │                   │                        │
                │                   ▼                        ▼
                │          ┌──────────────────┐     ┌──────────────────┐
                │          │ Approve Button   │     │ Sign In Button   │
                │          │ Countdown Timer  │     │ (NextAuth Login) │
                │          │ Device Details   │     └──────────────────┘
                │          └──────────────────┘              │
                │                   │                        ▼
                │                   │          ┌──────────────────────┐
                │                   │          │ User Logs In...      │
                │                   │          │ (Email/Password/     │
                │                   │          │  OAuth, etc)         │
                │                   │          └──────────────────────┘
                │                   │                        │
                │                   │              ┌─────────┘
                │                   ▼              ▼
                │          ┌──────────────────────────────┐
                │          │ User Clicks "Approve Device" │
                │          └──────────────────────────────┘
                │                   │
                │                   ▼
                │          ┌──────────────────────────────┐
                │          │ POST /approve [requestId]    │
                │          │ ✓ Requires NextAuth session  │
                │          │ ✓ Create Device record       │
                │          │ ✓ Generate JWT token         │
                │          └──────────────────────────────┘
                │                   │
                │       ┌───────────────────────────┐
                │       │ accessToken: "jwt..."     │
                │       │ user: {id, name, email}   │
                │       └───────────────────────────┘
                │                   │
                ▼                   ▼
    ┌──────────────────────┐         │
    │ GET returns:         │         │
    │ status: approved     │         │
    │ userId: "xxx"        │◄────────┘
    └──────────────────────┘
                │
                ▼
    ┌──────────────────────────┐
    │ POST /approve [requestId]│
    │ ✓ Get JWT token          │
    │ ✓ Persist session        │
    │ ✓ Store in SecureStore   │
    └──────────────────────────┘
                │
                ▼
    ┌──────────────────────────┐
    │ 🎉 SIGNED IN!            │
    │ Auto-navigate to         │
    │ Dashboard                │
    └──────────────────────────┘
                │
                ▼
    ┌──────────────────────────┐
    │ END: Dashboard Screen    │
    │ User = logged in         │
    │ Ready to use app         │
    └──────────────────────────┘
```

## 📱 Screen Mockups

### Mobile - Login Screen
```
┌─────────────────────────────────┐
│        🧠 Second Brain          │
│  Your personal knowledge hub    │
├─────────────────────────────────┤
│                                 │
│   Email                         │
│   ┌───────────────────────────┐ │
│   │  you@example.com          │ │
│   └───────────────────────────┘ │
│                                 │
│   Password                      │
│   ┌───────────────────────────┐ │
│   │  ••••••••            👁    │ │
│   └───────────────────────────┘ │
│                                 │
│   ┌─────────────────────────────┐
│   │   Sign In                   │
│   └─────────────────────────────┘
│                                 │
│   ┌──────── QR CODE ────────┐   │
│   │ 📱 Connect with QR Code │   │
│   └─────────────────────────┘   │
│                                 │
│   ─────────────────────────────  │
│   Don't have an account?        │
│   ─────────────────────────────  │
│                                 │
│   ┌─────────────────────────────┐
│   │   Create Account            │
│   └─────────────────────────────┘
│                                 │
└─────────────────────────────────┘
```

### Mobile - Connect Screen
```
┌─────────────────────────────────┐
│     🔙  Scan QR Code            │
│  Open Second Brain on your      │
│  computer, go to                │
│  Dashboard → Connect            │
│                                 │
│    ┌──────────────────────────┐ │
│    │  ╱─────────────────────╲ │ │
│    │ │     QR CODE HERE      │ │ │
│    │ │  (Viewfinder Box)     │ │ │
│    │  ╲─────────────────────╱ │ │
│    └──────────────────────────┘ │
│                                 │
│   [  Scan Again  ]              │
│                                 │
│   ┌─────────────────────────────┐
│   │ 🌐 Sign In with Browser     │
│   └─────────────────────────────┘
│                                 │
└─────────────────────────────────┘
```

### Mobile - Browser Sign-In Screen
```
┌─────────────────────────────────┐
│        🧠 Second Brain          │
│  Your personal knowledge hub    │
├─────────────────────────────────┤
│                                 │
│  Sign In with Browser           │
│                                 │
│  ┌──────────────────────────┐   │
│  │ ℹ️  Open in Browser      │   │
│  │ Tap the button below to  │   │
│  │ open your browser.       │   │
│  │ Approve the device       │   │
│  │ there and you'll be      │   │
│  │ automatically signed in. │   │
│  └──────────────────────────┘   │
│                                 │
│  ┌─────────────────────────────┐
│  │ 🌐  Open Browser            │
│  └─────────────────────────────┘
│                                 │
│  STEPS:                         │
│  1️⃣  Tap the button             │
│  2️⃣  Sign In (if needed)        │
│  3️⃣  Approve Device             │
│  4️⃣  All Set!                   │
│                                 │
│  ─────────────────────────────  │
│  Other options                  │
│  ─────────────────────────────  │
│                                 │
│  ┌─────────────────────────────┐
│  │ 📱 Sign In with QR Code     │
│  └─────────────────────────────┘
│                                 │
│  ┌─────────────────────────────┐
│  │ ← Back                      │
│  └─────────────────────────────┘
│                                 │
└─────────────────────────────────┘
```

### Web - Device Approval Page (Not Logged In)
```
┌──────────────────────────────────────┐
│                                      │
│       ⚠️  Device Verification        │
│    Approve access from your          │
│          mobile device               │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Please log in to approve       │  │
│  │ this device                    │  │
│  │                                │  │
│  │ [  Sign In First  ]            │  │
│  └────────────────────────────────┘  │
│                                      │
│  Make sure you recognize this       │
│  device before approving            │
│                                      │
└──────────────────────────────────────┘
```

### Web - Device Approval Page (Logged In)
```
┌──────────────────────────────────────┐
│                                      │
│       📱 Device Verification         │
│    Approve access from your          │
│          mobile device               │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Verification Details           │  │
│  │                                │  │
│  │ Request ID:  a3f5... (8 chars) │  │
│  │ Expires in:  4:32              │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ✓  Approve Device              │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │    Deny                        │  │
│  └────────────────────────────────┘  │
│                                      │
│  Make sure you recognize this       │
│  device before approving            │
│                                      │
└──────────────────────────────────────┘
```

### Web - Success Page
```
┌──────────────────────────────────────┐
│                                      │
│       ✓ Device Approved!             │
│                                      │
│  Your device has been               │
│  successfully verified.             │
│  You can now close this window      │
│  and return to your app.            │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Go to Dashboard                │  │
│  └────────────────────────────────┘  │
│                                      │
└──────────────────────────────────────┘
```

## 🔄 Request/Response Timeline

```
TIMESTAMP    MOBILE APP             API SERVER            WEB BROWSER
─────────────────────────────────────────────────────────────────────

  0:00s   Tap Button
          Generate UUID          
          + Device Info
                                   
  0:01s                           POST /initiate
                                  Status: 201
                                  {requestId, url}
          ◄─────────────────────────
          Open Browser
                                  ────────────────────────────────►
          
  0:02s                                                   Browser opens
                                                          Page loads
                                                          
  0:03s                           User sees
                                  approval page
                                  
  0:04s   Start Polling
          GET /verify/[id]
                                  ◄─────────────────────────────────
          status: pending
          Retry in 1s
          
  0:05s   GET /verify/[id]
                                  ────────────────────────────────►
                                  User clicks Approve
          status: pending         (requires login if needed)
          Retry in 1s
          
  0:06s   GET /verify/[id]
                                  ◄─────────────────────────────────
          status: pending         POST /approve [id]
                                  Status: 200
                                  {accessToken, user}
          Retry in 1s
          
  0:07s   GET /verify/[id]
                                  ────────────────────────────────►
          status: approved
          userId: xxx
          
  0:08s   POST /approve [id]
          ◄─────────────────────────────────────────────────────────
          {accessToken, user}
          
  0:09s   Persist Session
          Save to SecureStore
          
  0:10s   Navigate to
          Dashboard
          ✅ SUCCESS!
```

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────┐        ┌──────────────────────┐           │
│  │   Mobile App         │        │   Web Browser        │           │
│  │                      │        │                      │           │
│  │ ┌────────────────┐   │        │ ┌────────────────┐   │           │
│  │ │ LoginScreen    │   │        │ │ AddDevicePage  │   │           │
│  │ └────────────────┘   │        │ └────────────────┘   │           │
│  │        │             │        │        │             │           │
│  │ ┌────────────────┐   │        │ ┌────────────────┐   │           │
│  │ │ BrowserSignIn  │   │        │ │ Approve Dialog │   │           │
│  │ │ Screen         │   │        │ └────────────────┘   │           │
│  │ └────────────────┘   │        │                      │           │
│  │        │             │        │                      │           │
│  │ ┌────────────────┐   │        │                      │           │
│  │ │ AuthContext    │   │        │                      │           │
│  │ │ loginWithBrow  │   │        │                      │           │
│  │ │ ser()          │   │        │                      │           │
│  │ └────────────────┘   │        │                      │           │
│  └──────────────────────┘        └──────────────────────┘           │
│           │                                    ▲                     │
│           └────────────────┬───────────────────┘                    │
│                            │                                        │
│                     Polling + Approval                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                          ▲       │
                          │       │
              ┌───────────┴───────┴──────────┐
              │                              │
              ▼                              ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│      API LAYER           │    │    DATABASE LAYER        │
├──────────────────────────┤    ├──────────────────────────┤
│                          │    │                          │
│ POST /initiate           │    │ ┌──────────────────────┐ │
│ GET /verify/[id]         │    │ │ DeviceVerification   │ │
│ POST /approve/[id]       │────┤ │ Collection:          │ │
│                          │    │ │ • requestId          │ │
│ NextAuth Session         │    │ │ • status             │ │
│ JWT Generation           │    │ │ • userId             │ │
│                          │    │ │ • expiresAt (TTL)    │ │
│                          │    │ └──────────────────────┘ │
│                          │    │                          │
│                          │    │ ┌──────────────────────┐ │
│                          │    │ │ Device Collection    │ │
│                          │    │ │ (Updated)            │ │
│                          │    │ └──────────────────────┘ │
│                          │    │                          │
└──────────────────────────┘    └──────────────────────────┘
```

## 🔐 Security Flow

```
┌─────────────────────────────────────────────────────────┐
│                   SECURITY CHECKS                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 1. REQUEST VALIDATION                                   │
│    └─ Verify requestId exists                           │
│    └─ Check NOT expired (compare with expiresAt)       │
│    └─ Check status is "pending" (prevent double-click) │
│                                                          │
│ 2. USER AUTHENTICATION (on /approve)                   │
│    └─ Require NextAuth session                          │
│    └─ Extract user ID from session                      │
│    └─ Verify user logged in (401 if not)              │
│                                                          │
│ 3. DEVICE ASSOCIATION                                   │
│    └─ Link device to approving user                     │
│    └─ Create Device record                              │
│    └─ Store device platform/name                        │
│                                                          │
│ 4. TOKEN GENERATION                                     │
│    └─ Use NEXTAUTH_SECRET to sign JWT                   │
│    └─ Include user ID + device ID                       │
│    └─ 30-day expiration                                 │
│                                                          │
│ 5. LOGGING & AUDIT                                      │
│    └─ Store approver IP address                         │
│    └─ Store approver user agent                         │
│    └─ Timestamp approval (approvedAt)                   │
│                                                          │
│ 6. AUTO-CLEANUP                                         │
│    └─ TTL index deletes expired requests                │
│    └─ 5-minute window hard-enforced                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 📊 Status State Machine

```
                          START
                            │
                            ▼
                   ┌─────────────────┐
                   │ PENDING         │
                   │ (Initial State) │
                   └─────────────────┘
                            │
                ┌───────────┬───────────┬──────────┐
                │           │           │          │
          (5 min expires) User approved User denied Timeout
                │           │           │          │
                ▼           ▼           ▼          ▼
        ┌──────────────┐ ┌────────┐ ┌────────┐ ┌────────┐
        │ EXPIRED      │ │APPROVED│ │REJECTED│ │EXPIRED │
        │ (Auto-del)   │ │(Active)│ │(Denied)│ │(Retry?)│
        └──────────────┘ └────────┘ └────────┘ └────────┘
                │            │          │          │
                └────────────┴──────────┴──────────┘
                            │
                            ▼
                       (Never Changes)
                      Request Cleaned Up
```

---

Enjoy your new browser sign-in feature! 🎉
