// Base URL of the deployed Second Brain web app.
// Production URL — used for direct email/password login.
// Note: when using QR code pairing the server URL is read automatically from
// the QR code, so this value is only needed for email/password login.
//
// For local development:
//   http://10.0.2.2:3000   (Android emulator → local Next.js dev server)
//   http://localhost:3000   (iOS simulator → local Next.js dev server)
export const API_BASE_URL = 'https://secondbrain.rohits.online'
