# FisSales Chatbot for Shopify

A powerful AI chatbot integration for Shopify stores that helps enhance customer service and engagement through automated conversations.

## 🤖 What is FisSales Chatbot?

FisSales Chatbot is a Shopify app that integrates an AI-powered chatbot into your store. It helps you:

- Provide instant customer support 24/7
- Answer customer questions automatically
- Guide customers through their shopping journey
- Reduce response time and improve customer satisfaction

## 🎯 Key Features

- **AI-Powered Conversations**: Advanced natural language processing for human-like interactions
- **Easy Integration**: Simple setup process with your existing AI API
- **Customizable**: Configure API settings to match your specific AI service
- **Shopify Native**: Seamlessly integrates with your Shopify store
- **Secure**: Protected API key management and secure communication

## ⚙️ Configuration

The app requires two main configuration settings:

1. **API URL**: The endpoint of your AI service
2. **API Key**: Authentication key for your AI service

These settings can be configured through the app's dashboard in your Shopify admin panel.

## 🔥 Firebase App Hosting Deployment

This app is deployed using Firebase App Hosting for scalable, serverless hosting.

### Environment Variables

Configure these environment variables in your Firebase backend:

#### Required Variables
- `SHOPIFY_API_KEY` - Your Shopify app's API key from the Partner Dashboard
- `SHOPIFY_API_SECRET` - Your Shopify app's API secret key from the Partner Dashboard
- `SHOPIFY_APP_URL` - Your app's Firebase URL (e.g., `https://fissales-chatbot--fissales-chatbot.europe-west4.hosted.app/`)
- `SHOPIFY_SCOPES` - Comma-separated list of Shopify API scopes (e.g., `read_products,write_products`)
- `FIREBASE_PROJECT_ID` - Your Firebase project ID

#### Optional Variables
- `NODE_ENV` - Environment mode (defaults to `production`)
- `PORT` - Server port (defaults to `3000`)

### Deploying to Firebase

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Deploy the app:
   ```bash
   ./deploy-firebase.sh
   ```

4. Or deploy manually:
   ```bash
   npm run build:firebase
   firebase apphosting:backends:deploy fissales-chatbot-backend
   firebase deploy --only firestore
   ```

## 🔒 Security & Privacy

- Secure API key storage using Firebase Firestore
- Encrypted communication with your AI service
- Compliant with Shopify's security standards
- Server-side only data access with Firebase Admin SDK

## 🚀 Getting Started

1. Install the app from the Shopify App Store
2. Navigate to the app settings in your Shopify admin
3. Configure your AI API settings
4. The chatbot will be automatically integrated into your store

## 📝 Requirements

- A Shopify store
- An AI service API endpoint
- Valid API key for your AI service
- Firebase project with App Hosting and Firestore enabled

## 🔧 Technical Details

- Built with Remix framework
- Deployed on Firebase App Hosting
- Database: Firebase Firestore
- Uses Shopify's App Bridge for seamless integration
- Implements Shopify's Polaris design system
- Supports Shopify's latest API version
- Serverless architecture with automatic scaling

## 📚 Support

For support or questions about the app, please contact our support team or visit our documentation.

## 📄 License

This app is provided by FisSales for Shopify store owners. 