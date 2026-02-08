# Shared API Key Information

## Overview

This project includes a **shared Google Gemini API key** in `backend/.env.example` so anyone who clones the repo can start using the app immediately without needing to create their own API key.

## Using the Shared Key

The shared API key is automatically included when you:
1. Run the setup script (`.\scripts\setup.ps1` or `./scripts/setup.sh`)
2. Or manually copy `backend/.env.example` to `backend/.env`

**No additional setup needed!** Just clone, run setup, and start the app.

## Rate Limits & Usage

### Shared Key Considerations

- **Free Tier Limits**: 15 requests per minute (RPM)
- **Shared Usage**: Multiple users may hit limits faster
- **App Rate Limiting**: Built-in 10 requests/hour per IP helps prevent abuse

### If You Hit Rate Limits

If you encounter rate limit errors:
1. **Wait a bit** - Limits reset periodically
2. **Get your own key** - Recommended for active development
3. **Check usage** - Visit https://makersuite.google.com/app/apikey

## Getting Your Own Key (Recommended)

For production or heavy usage, get your own API key:

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key
5. Replace in `backend/.env`: `GOOGLE_API_KEY=your-key-here`
6. Restart backend

**Benefits:**
- ✅ Your own quota
- ✅ No sharing limits
- ✅ Better for production
- ✅ Free tier available

## Security Notes

- ✅ The shared key is in `.env.example` (committed to git)
- ✅ This is intentional for easy setup
- ✅ For production, use your own key
- ✅ Rotate keys periodically

## Best Practices

### Development
- ✅ Shared key is fine for testing
- ✅ App has rate limiting built-in
- ✅ SQLite database (no external dependencies)

### Production
- ❌ Don't use shared key
- ✅ Get your own API key
- ✅ Set up proper environment variables
- ✅ Monitor API usage

## Troubleshooting

### "Quota exceeded" error
- **Cause**: Too many requests on shared key
- **Fix**: Wait a bit or get your own key

### "API key not valid"
- **Cause**: Key may have been rotated
- **Fix**: Get a new key from Google AI Studio

### Rate limit errors
- **Cause**: Hitting 15 RPM limit
- **Fix**: App rate limiting should prevent this, but if it happens, wait or use your own key

## Current Shared Key

The shared key is included in `backend/.env.example`:
```
GOOGLE_API_KEY=AIzaSyAUUiKmrSVckd9jeBp6plG4rvxjfuuYgUY
```

This key is:
- ✅ Free tier compatible
- ✅ Works with gemini-2.5-flash
- ✅ Suitable for development/testing
- ⚠️ Shared with all users (may hit limits)

## Questions?

- See [Google API Setup](./GOOGLE_API_SETUP.md) for detailed API configuration
- See [Free Tier Setup](./FREE_TIER_SETUP.md) for free tier information
- See [Troubleshooting](./TROUBLESHOOTING.md) for common issues
