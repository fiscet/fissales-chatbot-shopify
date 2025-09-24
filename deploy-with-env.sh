#!/bin/bash

echo "🚀 Deploying Fissales Chatbot to Google Cloud Run with Environment Variables"
echo "=========================================================================="

# Deploy with all required environment variables
gcloud run deploy fissales-chatbot \
  --image gcr.io/fissales-chatbot/fissales-chatbot-shopify \
  --platform managed \
  --region europe-west4 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars="NODE_ENV=production,FIREBASE_PROJECT_ID=fissales-chatbot,SHOPIFY_API_KEY=62d1c4603664a9155547e9840cacf1b4,SHOPIFY_API_SECRET=your_secret_here,SHOPIFY_APP_URL=https://fissales-chatbot-xxxxx-ew.a.run.app,SCOPES=read_products,write_products" \
  --timeout=300 \
  --memory=1Gi \
  --cpu=1

echo ""
echo "✅ Deployment completed!"
echo "🌐 Your app will be available at the URL shown above"
echo ""
echo "📝 Next steps:"
echo "1. Copy the service URL"
echo "2. Update your Shopify app configuration with the new URL"
echo "3. Test the deployment"
