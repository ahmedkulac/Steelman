# 🔑 OpenRouter API Setup

Your project is now configured to use OpenRouter API instead of Google Gemini.

---

## ✅ What's Already Configured

- ✅ AI service updated to use OpenRouter
- ✅ API calls configured correctly
- ✅ JSON parsing and repair systems in place
- ✅ Error handling implemented

---

## 🔑 Environment Variables

### Backend (.env)

**Required:**
```env
OPENROUTER_API_KEY=Sk-or-v1-e1bc52f5bdffc6ba167ec870ba0f9b752d56d04c8f53d1f952970872f59e1cd0
```

**Optional:**
```env
AI_MODEL=google/gemini-2.0-flash-001
AI_MAX_TOKENS=2000
SITE_URL=http://localhost:3000
SITE_NAME=Steelman
```

### Railway (Production)

Add these environment variables in Railway dashboard:

**Required:**
```
OPENROUTER_API_KEY=Sk-or-v1-e1bc52f5bdffc6ba167ec870ba0f9b752d56d04c8f53d1f952970872f59e1cd0
```

**Optional:**
```
AI_MODEL=google/gemini-2.0-flash-001
AI_MAX_TOKENS=2000
SITE_URL=https://your-app.vercel.app
SITE_NAME=Steelman
```

---

## 🤖 Available Models

OpenRouter supports many models. Change `AI_MODEL` to use different ones:

**Recommended:**
- `google/gemini-2.0-flash-001` (default - fast, cheap)
- `google/gemini-2.0-flash-thinking-exp-1219` (better reasoning)
- `anthropic/claude-3.5-sonnet` (high quality)
- `openai/gpt-4-turbo` (very high quality, more expensive)

**See all models:** https://openrouter.ai/models

---

## 📋 Setup Steps

### Local Development

1. **Update backend/.env:**
   ```env
   OPENROUTER_API_KEY=Sk-or-v1-e1bc52f5bdffc6ba167ec870ba0f9b752d56d04c8f53d1f952970872f59e1cd0
   AI_MODEL=google/gemini-2.0-flash-001
   ```

2. **Restart backend:**
   ```bash
   npm run dev:backend
   ```

3. **Test:** Submit a claim and verify it works

### Railway (Production)

1. **Go to Railway Dashboard**
   - Your service → Variables tab

2. **Remove old variables** (if exist):
   - `GOOGLE_API_KEY`
   - `GEMINI_API_KEY`

3. **Add new variables:**
   ```
   OPENROUTER_API_KEY=Sk-or-v1-e1bc52f5bdffc6ba167ec870ba0f9b752d56d04c8f53d1f952970872f59e1cd0
   AI_MODEL=google/gemini-2.0-flash-001
   SITE_URL=https://your-app.vercel.app
   SITE_NAME=Steelman
   ```

4. **Redeploy** - Railway will use the new API

---

## 🔍 Verify It's Working

1. **Check backend logs** for OpenRouter API calls
2. **Submit a test claim**
3. **Verify counter-arguments are generated**
4. **Check Railway logs** for any API errors

---

## 💡 Benefits of OpenRouter

- ✅ Access to multiple AI models
- ✅ Easy model switching
- ✅ Unified API interface
- ✅ Good pricing options
- ✅ Reliable service

---

## 🆘 Troubleshooting

**Error: "OPENROUTER_API_KEY is not configured"**
- Check environment variable is set correctly
- Verify variable name is exactly `OPENROUTER_API_KEY`
- Restart backend after adding variable

**Error: "OpenRouter API call failed"**
- Check API key is valid
- Verify you have credits/balance on OpenRouter
- Check model name is correct
- Review Railway logs for specific error

**Different model behavior:**
- Try different models by changing `AI_MODEL`
- Some models may have different JSON formatting
- Our JSON repair system should handle most cases

---

## 📚 OpenRouter Resources

- **Dashboard:** https://openrouter.ai/
- **Models:** https://openrouter.ai/models
- **API Docs:** https://openrouter.ai/docs
- **Pricing:** https://openrouter.ai/docs/pricing

---

**Your API key has been configured! The service is ready to use OpenRouter.** 🚀
