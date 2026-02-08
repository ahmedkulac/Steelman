# Gemini Free Tier Setup Guide

## Free Tier Overview

Google's Gemini API free tier includes:
- **Generous free quota** - No credit card required initially
- **Rate limits**: 15 requests per minute (RPM)
- **Available models**: `gemini-pro` (most reliable)
- **Usage limits**: Check your quota at https://aistudio.google.com/app/apikey

## Recommended Configuration

### Model Selection

For free tier, use **`gemini-2.5-flash`** (already configured):

```env
AI_MODEL=gemini-2.5-flash
```

This model:
- ✅ Latest balanced model (speed + capability)
- ✅ Available on free tier
- ✅ 1 million token context window
- ✅ Fast responses
- ✅ Good performance

### Rate Limiting

The app is configured with conservative rate limits to stay within free tier:

```env
RATE_LIMIT_WINDOW_MS=3600000  # 1 hour
RATE_LIMIT_MAX_REQUESTS=10    # 10 requests per hour per IP
```

This is **much lower** than Google's 15 RPM limit, so you won't hit API limits.

## Free Tier Models

### ✅ Available Models

- **`gemini-2.5-flash`** - ✅ Recommended, latest balanced model (configured)
- **`gemini-2.5-pro`** - ✅ Powerful reasoning model
- **`gemini-pro`** - ✅ Stable, widely available
- **`gemini-1.0-pro`** - ✅ Usually available
- **`gemini-1.5-flash`** - ⚠️ May not be available in all regions
- **`gemini-1.5-pro`** - ⚠️ May require paid tier

### ❌ Not Available

- Some newer models may require paid tier
- Check availability at https://aistudio.google.com/app/apikey

## Monitoring Usage

1. **Check Quota:**
   - Visit: https://aistudio.google.com/app/apikey
   - View your API usage and limits

2. **App Rate Limiting:**
   - The app limits to 10 requests/hour per IP
   - Prevents accidental overuse
   - Protects your free tier quota

3. **Caching:**
   - Identical claims are cached (when Redis enabled)
   - Reduces API calls
   - Saves quota

## Cost Optimization Tips

### 1. Enable Caching (Optional)

If you set up Redis, identical claims are cached for 7 days:

```env
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379
```

Then start Redis:
```powershell
docker-compose up -d redis
```

### 2. Use Conservative Limits

Current settings are already conservative:
- 10 requests/hour per IP (vs Google's 15/minute)
- Prevents quota exhaustion

### 3. Monitor API Calls

Check backend logs for API call frequency and errors.

## Free Tier Limits

| Limit | Value | Notes |
|-------|-------|-------|
| Requests per minute | 15 RPM | Google's limit |
| App limit | 10/hour/IP | Our conservative limit |
| Daily quota | Varies | Check your dashboard |
| Model | gemini-pro | Most reliable |

## Upgrading to Paid Tier

If you need more:
1. Visit Google Cloud Console
2. Enable billing
3. Higher quotas available
4. Access to more models

## Troubleshooting Free Tier Issues

### "Quota exceeded"
- You've hit your free tier limit
- Wait for quota reset (usually daily)
- Check usage at https://aistudio.google.com/app/apikey

### "Rate limit exceeded"
- Too many requests too quickly
- App rate limiting should prevent this
- Wait a bit and try again

### "Model not found"
- Some models require paid tier
- Stick with `gemini-pro` (free tier compatible)
- Check model availability

## Current Configuration

Your app is already optimized for free tier:

✅ **Model**: `gemini-2.5-flash` (latest balanced model, free tier compatible)  
✅ **Rate limiting**: 10/hour/IP (conservative)  
✅ **Caching**: Optional (saves quota)  
✅ **Error handling**: Graceful fallbacks  

## Testing

Test your setup:

1. **Submit a claim** via the frontend
2. **Check backend logs** for API calls
3. **Monitor quota** at Google AI Studio
4. **Verify responses** are working

Everything should work smoothly on the free tier! 🎉
