# Fissales Chatbot Shopify App

An AI-powered chatbot for Shopify stores that provides customer support and product recommendations.

## Features

- **Large Chat Interface**: Spacious chat area for customer interactions
- **Admin Settings Panel**: Configure API keys and external API URLs
- **Product Recommendations**: Display recommended products from chatbot responses
- **Session Management**: Track user sessions and maintain conversation history
- **Shopify Integration**: Embedded app with proper authentication and permissions
- **Real-time Communication**: Send requests to external AI services with proper headers

## Technical Stack

- **Framework**: Remix (React-based)
- **Platform**: Shopify Embedded App
- **Database**: Firestore (fallback storage)
- **UI Components**: Shopify Polaris
- **Authentication**: Shopify OAuth
- **API Integration**: External chatbot service

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Copy the content from `env_config.txt` to create a `.env.local` file:
   ```bash
   # Copy the content from env_config.txt to .env.local
   # Or use the env_example as a template
   ```

3. **Update Configuration**
   Edit `.env.local` with your actual values:
   - `SHOPIFY_API_KEY`: Your Shopify app API key
   - `SHOPIFY_API_SECRET`: Your Shopify app secret
   - `SHOPIFY_APP_URL`: Your app's public URL
   - `FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `FIREBASE_PRIVATE_KEY`: Your Firebase private key
   - `FIREBASE_CLIENT_EMAIL`: Your Firebase client email

   **Note**: External API configuration (URL and API key) is managed through the app settings page in Shopify admin, not through environment variables.

4. **Update Shopify App Configuration**
   Edit `shopify.app.toml` with your app details:
   - `client_id`: Your Shopify app client ID
   - `application_url`: Your app's public URL
   - `dev_store_url`: Your development store URL

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## Project Structure

```
fissales-chatbot-shopify/
├── app/
│   ├── routes/
│   │   ├── _index.tsx (main landing page)
│   │   ├── app._index.tsx (admin dashboard)
│   │   ├── app.chat.tsx (chatbot interface)
│   │   ├── app.settings.tsx (settings page)
│   │   └── auth/ (authentication routes)
│   ├── lib/
│   │   ├── shopify.server.ts (Shopify configuration)
│   │   └── polaris-provider.tsx (UI provider)
│   └── root.tsx (app root)
├── ai_docs/
│   ├── Requirements.md
│   └── tasks/ (detailed task breakdowns)
├── shopify.app.toml (Shopify app configuration)
└── package.json
```

## API Integration

The chatbot sends requests to your external API (configured through the app settings page) with the following format:

### Request Headers
- `sessionId`: Unique session identifier
- `userId`: Shopify user ID (if logged in)
- `apiKey`: API key from admin settings
- `Content-Type`: application/json

### Request Body
```json
{
  "message": "Customer message text"
}
```

### Expected Response Format
```json
{
  "response": "Bot response text",
  "recommendedProducts": [
    {
      "name": "Product Name",
      "price": "199.99",
      "features": ["Feature 1", "Feature 2"],
      "benefits": ["Benefit 1", "Benefit 2"],
      "availability": "in stock",
      "productUrl": "https://store.myshopify.com/products/product-handle"
    }
  ]
}
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run typecheck` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

### Testing

The app includes comprehensive testing setup:
- Unit tests for components and utilities
- Integration tests for API endpoints
- End-to-end tests for user flows
- Performance and security testing

## Deployment

1. **Build the App**
   ```bash
   npm run build
   ```

2. **Deploy to Your Hosting Platform**
   - Update environment variables in production
   - Ensure SSL certificates are configured
   - Set up monitoring and logging

3. **Update Shopify App Settings**
   - Update app URLs in Shopify Partner Dashboard
   - Configure webhook endpoints
   - Test app installation

## Security

- Shopify OAuth authentication
- Secure API key storage
- Input validation and sanitization
- Webhook signature verification
- Session management security

## Support

For support and questions:
- Check the documentation in `ai_docs/`
- Review the task breakdowns in `ai_docs/tasks/`
- Contact: support@fissales.com

## License

This project is proprietary software. All rights reserved.
