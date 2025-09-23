#!/bin/bash

echo "🚀 Deploying FisSales Chatbot to Firebase App Hosting..."

# Build the app
echo "📦 Building the app..."
npm run build:firebase

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Deploy to Firebase App Hosting
echo "🔥 Deploying to Firebase App Hosting..."
firebase apphosting:backends:deploy fissales-chatbot-backend

# Deploy Firestore rules
echo "📊 Deploying Firestore rules..."
firebase deploy --only firestore

echo "✅ Deployment complete!"
echo "🌐 Your app URL will be shown after deployment"
echo "📊 Check Firebase Console for the exact URL"
