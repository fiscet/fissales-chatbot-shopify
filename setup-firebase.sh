#!/bin/bash

echo "🔥 Firebase Setup for Shopify App"
echo "================================="
echo ""

echo "1. Go to https://console.firebase.google.com/"
echo "2. Create a new project or select existing one"
echo "3. Enable Firestore Database"
echo "4. Go to Project Settings > Service Accounts"
echo "5. Generate new private key (downloads JSON file)"
echo ""

read -p "Enter your Firebase Project ID: " PROJECT_ID
read -p "Enter the path to your service account JSON file: " JSON_PATH

if [ -f "$JSON_PATH" ]; then
    echo ""
    echo "✅ Setting environment variables..."
    
    # Set project ID
    echo "export FIREBASE_PROJECT_ID=\"$PROJECT_ID\"" >> ~/.bashrc
    echo "export FIREBASE_PROJECT_ID=\"$PROJECT_ID\"" >> ~/.zshrc
    
    # Set service account key
    SERVICE_ACCOUNT_KEY=$(cat "$JSON_PATH" | tr -d '\n' | tr -d ' ')
    echo "export FIREBASE_SERVICE_ACCOUNT_KEY='$SERVICE_ACCOUNT_KEY'" >> ~/.bashrc
    echo "export FIREBASE_SERVICE_ACCOUNT_KEY='$SERVICE_ACCOUNT_KEY'" >> ~/.zshrc
    
    echo ""
    echo "✅ Environment variables set!"
    echo "📝 Added to ~/.bashrc and ~/.zshrc"
    echo ""
    echo "🔄 To apply changes, run:"
    echo "   source ~/.bashrc"
    echo "   # or"
    echo "   source ~/.zshrc"
    echo ""
    echo "🧪 Test with:"
    echo "   SHOPIFY_APP_URL=http://localhost:3000 npm run dev"
else
    echo "❌ JSON file not found at: $JSON_PATH"
    echo "Please check the path and try again."
fi
