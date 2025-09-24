# Deploy Instructions for Fissales Chatbot

## Deploying the App with Theme Extension

After creating the theme extension, you need to deploy the app to make it available in Shopify.

### 1. Install Shopify CLI (if not already installed)

```bash
npm install -g @shopify/cli @shopify/theme
```

### 2. Login to Shopify CLI

```bash
shopify auth login
```

### 3. Deploy the App with Extensions

```bash
# From the project root directory
shopify app deploy
```

This will:
- Build the Remix app
- Deploy the theme extension
- Update the app configuration in Shopify

### 4. Update App Permissions

After deployment, you may need to update the app permissions in the Shopify Partner Dashboard:

1. Go to your Shopify Partner Dashboard
2. Navigate to your app
3. Go to "App setup" → "App permissions"
4. Make sure these scopes are enabled:
   - `read_metafields`
   - `write_metafields`
   - `read_products`
   - `read_orders`
   - `read_customers`
   - `write_products`

### 5. Test the Extension

1. Install the app in a development store
2. Go to **Online Store → Themes**
3. Click **Customize** on your active theme
4. Look for **"Fissales Chatbot"** in the app blocks
5. Drag and drop it to your desired location
6. Customize the settings in the theme editor

### 6. Alternative: Manual Extension Installation

If the automatic deployment doesn't work, you can manually add the extension:

1. Copy the contents of `extensions/chatbot/blocks/embed_chatbot.liquid`
2. Go to **Online Store → Themes → Actions → Edit code**
3. Create a new file: `snippets/embed_chatbot.liquid`
4. Paste the content
5. Add `{% render 'embed_chatbot' %}` to your theme.liquid file

### Troubleshooting

**Extension not appearing in theme editor:**
- Make sure the app is properly deployed
- Check that the extension is registered in `shopify.app.toml`
- Verify app permissions include metafields access

**App deployment fails:**
- Check your Shopify CLI version: `shopify version`
- Update if needed: `npm update -g @shopify/cli`
- Try deploying again: `shopify app deploy`

**Theme extension not working:**
- Check browser console for JavaScript errors
- Verify the API endpoint is accessible
- Make sure the chatbot is enabled in app settings

### Development Commands

```bash
# Start development server
shopify app dev

# Deploy to production
shopify app deploy

# Generate app URL
shopify app generate extension

# Check app status
shopify app info
```
