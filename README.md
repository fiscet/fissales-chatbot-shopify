# Villma Chatbot for Shopify

A powerful AI chatbot integration for Shopify stores that helps enhance customer service and engagement through automated conversations.

## 🤖 What is Villma Chatbot?

Villma Chatbot is a Shopify app that integrates an AI-powered chatbot into your store. It helps you:

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

## 🐳 Docker Deployment

### Environment Variables

The following environment variables are required for Docker deployment:

#### Required Variables
- `SHOPIFY_API_KEY` - Your Shopify app's API key from the Partner Dashboard
- `SHOPIFY_API_SECRET` - Your Shopify app's API secret key from the Partner Dashboard
- `SHOPIFY_APP_URL` - Your app's public URL (e.g., `https://your-app-domain.com`)
- `SCOPES` - Comma-separated list of Shopify API scopes (e.g., `read_metafields,write_metafields`)

#### Optional Variables
- `NODE_ENV` - Environment mode (defaults to `production`)
- `PORT` - Server port (defaults to `3000`)
- `SHOP_CUSTOM_DOMAIN` - Custom shop domain if needed

### Running with Docker

1. Build the Docker image:
   ```bash
   docker build -t villma-chatbot .
   ```

2. Run the container with environment variables:
   ```bash
   docker run -d \
     -p 3000:3000 \
     -e SHOPIFY_API_KEY=your_api_key \
     -e SHOPIFY_API_SECRET=your_api_secret \
     -e SHOPIFY_APP_URL=https://your-app-domain.com \
     -e SCOPES=read_metafields,write_metafields \
     villma-chatbot
   ```

3. Or use a `.env` file:
   ```bash
   docker run -d \
     -p 3000:3000 \
     --env-file .env \
     villma-chatbot
   ```

The container will automatically check for required environment variables on startup and provide helpful error messages if any are missing.

## 🔒 Security & Privacy

- Secure API key storage using Shopify's metafields
- Encrypted communication with your AI service
- Compliant with Shopify's security standards

## 🚀 Getting Started

1. Install the app from the Shopify App Store
2. Navigate to the app settings in your Shopify admin
3. Configure your AI API settings
4. The chatbot will be automatically integrated into your store

## 📝 Requirements

- A Shopify store
- An AI service API endpoint
- Valid API key for your AI service

## 🔧 Technical Details

- Built with Remix framework
- Uses Shopify's App Bridge for seamless integration
- Implements Shopify's Polaris design system
- Supports Shopify's latest API version

## 📚 Support

For support or questions about the app, please contact our support team or visit our documentation.

## 📄 License

This app is provided by Villma for Shopify store owners. 