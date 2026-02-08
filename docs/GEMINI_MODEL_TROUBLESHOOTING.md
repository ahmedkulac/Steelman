# Gemini Model Troubleshooting

## Common Model Errors

### Error: "model is not found for API version v1beta"

This means the model name isn't available with your API key or region.

## Solution: Try Different Models

Update `AI_MODEL` in `backend/.env`:

### Option 1: gemini-2.5-flash (Latest - Currently Configured)
```env
AI_MODEL=gemini-2.5-flash
```
**Best for:** Latest balanced model, speed + capability, 1M token context

### Option 2: gemini-2.5-pro
```env
AI_MODEL=gemini-2.5-pro
```
**Best for:** Most powerful reasoning, latest generation

### Option 3: gemini-pro (Most Compatible - Fallback)
```env
AI_MODEL=gemini-pro
```
**Best for:** Maximum compatibility, stable, works everywhere

### Option 4: gemini-1.0-pro
```env
AI_MODEL=gemini-1.0-pro
```
**Best for:** Stable production model

### Option 5: gemini-1.5-flash
```env
AI_MODEL=gemini-1.5-flash
```
**Best for:** Faster responses, newer model (may not be available in all regions)

## How to Change Model

1. **Edit `backend/.env`:**
   ```env
   AI_MODEL=gemini-pro
   ```

2. **Restart backend:**
   ```powershell
   # Stop current backend (Ctrl+C)
   # Then restart
   npm run dev:backend
   ```

## Check Available Models

You can check which models are available with your API key by visiting:
- https://aistudio.google.com/app/apikey
- Or check your Google Cloud Console

## Default Model

The app defaults to `gemini-2.5-flash` which is the latest balanced model with excellent speed and capability.

## Model Comparison

| Model | Speed | Capability | Availability |
|-------|-------|------------|--------------|
| gemini-2.5-flash | Very Fast | Excellent | ✅ Latest (configured) |
| gemini-2.5-pro | Medium | Best | ✅ Latest |
| gemini-pro | Fast | Good | ✅ Widest |
| gemini-1.0-pro | Medium | Better | ✅ Wide |
| gemini-1.5-flash | Very Fast | Good | ⚠️ Regional |
| gemini-1.5-pro | Slower | Best | ⚠️ Regional |

## Still Having Issues?

1. **Verify API Key:**
   - Make sure `GOOGLE_API_KEY` is set correctly
   - Check key is active at https://aistudio.google.com/app/apikey

2. **Check API Quota:**
   - Free tier has limits
   - Check if you've exceeded quota

3. **Try gemini-2.5-flash (current):**
   - Latest balanced model
   - If not available, try gemini-pro as fallback

4. **Check Region:**
   - Some models may not be available in all regions
   - Use `gemini-pro` for maximum compatibility
