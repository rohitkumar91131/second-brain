# Second Brain Node.js API Backend

Express.js backend for the Second Brain mobile app, deployed at `https://secondbrainnodeapi.rohits.online`.

## Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in .env values
npm start
```

## Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string (same DB as Next.js app) |
| `JWT_SECRET` | Secret key for JWT tokens (use the same value as `NEXTAUTH_SECRET` in Next.js) |
| `EMAIL_USER` | Gmail address for sending OTP emails |
| `EMAIL_PASS` | Gmail App Password |
| `PORT` | Server port (default: 4000) |

## API Routes

### Auth (no token required)
- `POST /api/auth/login` — email/password login
- `POST /api/auth/register` — create new account
- `POST /api/auth/device/verify` — QR-code device connect
- `POST /api/auth/device/otp/verify` — OTP device connect (`{ email, otp, deviceId, deviceName, platform }`)

### Protected (Bearer JWT required)
- `GET/POST /api/notes`
- `GET/PATCH/DELETE /api/notes/:id`
- `GET /api/notes/:id/blocks`
- `POST /api/blocks` — create block
- `GET/PATCH/DELETE /api/blocks/:id`
- `PUT /api/blocks/bulk` — bulk update
- `GET /api/blocks/media` — media blocks
- `GET/POST /api/tasks`, `GET/PATCH/DELETE /api/tasks/:id`
- `GET/POST /api/projects`, `GET/PATCH/DELETE /api/projects/:id`
- `GET/POST /api/goals`, `GET/PATCH/DELETE /api/goals/:id`
- `GET/POST /api/journal`, `GET/PATCH/DELETE /api/journal/:id`
- `GET /api/journal/:id/blocks`
- `GET/POST /api/resources`, `GET/PATCH/DELETE /api/resources/:id`
- `GET /api/device` — list devices
- `DELETE /api/device/:id` — remove device
- `GET/PATCH /api/user/profile`

## OTP Device Connection Flow

1. User logs into website → goes to `/dashboard/connect/otp`
2. Website calls `POST /api/device/otp` (Next.js route) which stores OTP in MongoDB
3. Website displays the 6-digit OTP
4. In the mobile app: user enters their email + the OTP
5. App calls `POST /api/auth/device/otp/verify` on this backend
6. Backend verifies OTP → returns JWT access token
7. App is now authenticated
