# Bahaba Dashboard

A Next.js app with Firebase Firestore backing a real-time dashboard for weather and multi-gate flood level readings.

## Prerequisites
- Node.js 18+
- Firebase project with a Web App configured

## Environment Variables
Create `.env.local` in the project root based on the template below. Values with NEXT_PUBLIC_ are from your Firebase Web App settings (Project Settings → General → Your apps → SDK setup & configuration).

```bash
# Client (Firebase Web App)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Server/Admin (Service account)
# Create a new service account key in Firebase console → Project Settings → Service accounts
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
# Important: keep newline escapes (\\n) in the private key value
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Any random string; used to protect the seed endpoint
SEED_SECRET=
```

You can also copy the provided example file:
```bash
cp .env.example .env.local
```

## Install & Run
```bash
npm i
npm run dev
```

## Seeding Sample Data
With the dev server running:
```bash
curl -X POST http://localhost:3000/api/seed -H "Authorization: Bearer $SEED_SECRET"
```

## Data Model
Collections:
- `weather`: { timestamp, temperatureC, humidityPct, windKph, rainMm }
- `readings`: { timestamp, gateId, level, risk }

Realtime listeners in `src/app/page.tsx` subscribe to both collections and render the dashboard.

## Gate Mapping
Adjust mapping in `src/app/page.tsx` if your gate IDs differ:
- north → Gate 1 (Outside)
- south → Gate 1 (Inside)
- east  → Gate 3 (Outside)
