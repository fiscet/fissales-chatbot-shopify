#!/bin/bash

echo "🚀 Deploying Fissales Chatbot to Google Cloud Run"
echo "=============================================="

# Set environment variables
export FIREBASE_PROJECT_ID="fissales-chatbot"
# Note: FIREBASE_SERVICE_ACCOUNT_KEY should be set as environment variable or secret

# Deploy to Cloud Run
gcloud run deploy fissales-chatbot \
  --image gcr.io/fissales-chatbot/fissales-chatbot-shopify \
  --platform managed \
  --region europe-west4 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars="NODE_ENV=production,FIREBASE_PROJECT_ID=fissales-chatbot" \
  --set-secrets="FIREBASE_SERVICE_ACCOUNT_KEY=fissales-chatbot-firebase-adminsdk-fbsvc-cce8571ac0:latest"

echo ""
echo "✅ Deployment completed!"
echo "🌐 Your app will be available at the URL shown above"
echo ""
echo "📝 Next steps:"
echo "1. Copy the service URL"
echo "2. Update your Shopify app configuration"
echo "3. Test the deployment"
