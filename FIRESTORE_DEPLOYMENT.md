# Fissales Chatbot - Firestore Migration & Deployment Guide

## Overview
This guide shows how to migrate from Prisma/SQLite to Firestore and deploy your Shopify app.

## Migration Changes Made

### 1. Database Layer
- ✅ Created `app/firestore.server.ts` - Firestore service layer
- ✅ Updated `app/db.server.ts` - New database interface
- ✅ Updated `app/routes/api.chat.tsx` - Uses Firestore instead of Prisma
- ✅ Updated `app/shopify.server.ts` - Uses memory session storage

### 2. Configuration Files
- ✅ Added `firebase.json` - Firebase project configuration
- ✅ Added `firestore.rules` - Security rules
- ✅ Added `firestore.indexes.json` - Database indexes
- ✅ Updated `package.json` - Firebase dependencies

## Environment Variables Required

```bash
# Shopify Configuration
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SHOPIFY_APP_URL=https://your-app-domain.com
SCOPES=read_products,write_products

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

## Deployment Options

### Option 1: Google Cloud Run (Recommended)

1. **Install dependencies:**
```bash
npm install
```

2. **Build Docker image:**
```bash
docker build -t gcr.io/fissales-chatbot/fissales-chatbot-shopify .
```

3. **Push to Google Container Registry:**
```bash
docker push gcr.io/fissales-chatbot/fissales-chatbot-shopify
```

4. **Deploy to Cloud Run:**
```bash
gcloud run deploy fissales-chatbot \
  --image gcr.io/fissales-chatbot/fissales-chatbot-shopify \
  --platform managed \
  --region europe-west4 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars="NODE_ENV=production,FIREBASE_PROJECT_ID=your-project-id"
```

### Option 2: Firebase App Hosting

1. **Install Firebase CLI:**
```bash
npm install -g firebase-tools
```

2. **Initialize Firebase:**
```bash
firebase init firestore
firebase init hosting
```

3. **Deploy:**
```bash
firebase deploy
```

## Firebase Setup Steps

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project
   - Enable Firestore Database

2. **Generate Service Account Key:**
   - Go to Project Settings > Service Accounts
   - Generate new private key
   - Download JSON file

3. **Set Environment Variables:**
   - Add `FIREBASE_PROJECT_ID`
   - Add `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON content)

## Data Migration

If you have existing data in SQLite:

1. **Export existing data:**
```bash
# Export sessions and settings from SQLite
sqlite3 prisma/dev.sqlite "SELECT * FROM Session;" > sessions.csv
sqlite3 prisma/dev.sqlite "SELECT * FROM Settings;" > settings.csv
```

2. **Import to Firestore:**
   - Use Firebase Admin SDK to import data
   - Or use Firebase Console to manually add documents

## Testing the Migration

1. **Start development server:**
```bash
npm run dev
```

2. **Test API endpoints:**
   - Check `/api/chat` endpoint
   - Verify Firestore collections are created
   - Test session management

## Benefits of Firestore

- ✅ **Serverless** - No database server to manage
- ✅ **Scalable** - Automatic scaling
- ✅ **Real-time** - Live data updates
- ✅ **Global** - Multi-region replication
- ✅ **Secure** - Built-in security rules
- ✅ **Cost-effective** - Pay per usage

## Next Steps

1. Install Firebase dependencies: `npm install`
2. Set up Firebase project and get credentials
3. Update environment variables
4. Test locally with `npm run dev`
5. Deploy to your chosen platform
