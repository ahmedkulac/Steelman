# Google Gemini API Setup Guide

## Getting Your API Key

1. **Visit Google AI Studio:**
   - Go to: https://makersuite.google.com/app/apikey
   - Or: https://aistudio.google.com/app/apikey

2. **Sign In:**
   - Sign in with your Google account

3. **Create API Key:**
   - Click "Create API Key"
   - Select or create a Google Cloud project
   - Copy your API key

4. **Add to Environment:**
   - Add the key to `backend/.env`:
     ```
     GOOGLE_API_KEY=your-api-key-here
     ```

## Available Models

The app supports these Gemini models (set via `AI_MODEL` in `.env`):

- `gemini-1.5-flash` (default) - Fast and efficient, good for most use cases
- `gemini-1.5-pro` - More capable, better for complex reasoning
- `gemini-pro` - Previous generation model
- `gemini-1.0-pro` - Stable production model

## Configuration

In `backend/.env`:

```env
# Required
GOOGLE_API_KEY=your-api-key-here

# Optional - Model selection
AI_MODEL=gemini-1.5-flash

# Optional - Max tokens (default: 2000)
AI_MAX_TOKENS=2000
```

## Rate Limits

Google Gemini API has free tier limits:
- **Free tier**: 15 requests per minute (RPM)
- **Paid tier**: Higher limits based on your plan

The app includes rate limiting (10 requests/hour per IP) to help stay within API limits.

## Cost

- **Free tier**: Generous free quota
- **Paid tier**: Pay-as-you-go pricing
- Check current pricing: https://ai.google.dev/pricing

## Troubleshooting

### "API key not valid"
- Make sure you copied the full API key
- Check for extra spaces or newlines
- Verify the key is active in Google AI Studio

### "Quota exceeded"
- You've hit the rate limit
- Wait a minute and try again
- Consider upgrading to paid tier for higher limits

### "Model not found"
- Check that the model name is correct
- Some models may require specific API access
- Try `gemini-1.5-flash` as it's widely available

### "Permission denied"
- Make sure the Gemini API is enabled in your Google Cloud project
- Check API permissions in Google Cloud Console

## Security Best Practices

1. **Never commit API keys to git**
   - Keep `.env` in `.gitignore` (already done)
   - Use environment variables in production

2. **Rotate keys regularly**
   - Generate new keys periodically
   - Revoke old keys if compromised

3. **Use server-side only**
   - API calls are made server-side (backend)
   - Keys never exposed to frontend

## Testing Your Setup

1. **Check environment variable:**
   ```bash
   # In backend directory
   node -e "require('dotenv').config(); console.log(process.env.GOOGLE_API_KEY ? 'Key found' : 'Key missing')"
   ```

2. **Test API connection:**
   - Start the backend: `npm run dev:backend`
   - Submit a test claim via the frontend
   - Check backend logs for any API errors

## Migration from OpenAI

If you were using OpenAI before:
- Remove `OPENAI_API_KEY` from `.env`
- Add `GOOGLE_API_KEY` instead
- The app will automatically use Google Gemini
- No code changes needed (already updated)
