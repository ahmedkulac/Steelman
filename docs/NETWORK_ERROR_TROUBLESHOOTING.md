# Network Error Troubleshooting Guide

## Issue: "Network Error" when submitting claims

This usually means the frontend cannot connect to the backend API.

## Quick Checks

### 1. Is the Backend Running?

Check if backend is running:
- Look for: `🚀 Server running on http://localhost:5000` in terminal
- Or visit: http://localhost:5000/health
- Should return: `{"status":"ok",...}`

### 2. Check Backend Port

Make sure backend is on port 5000:
- Check `backend/.env`: `PORT=5000`
- Check if port 5000 is available: `netstat -ano | findstr :5000`

### 3. Check Frontend API URL

Verify frontend is pointing to correct backend:
- Check `frontend/.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
- Restart frontend after changing `.env.local`

### 4. CORS Issues

Backend should have CORS enabled (already configured):
```typescript
app.use(cors()); // Allows all origins in development
```

## Step-by-Step Fix

### Step 1: Verify Backend is Running

```powershell
# Check backend terminal for:
🚀 Server running on http://localhost:5000
📊 Health check: http://localhost:5000/health
```

If not running:
```powershell
npm run dev:backend
```

### Step 2: Test Backend Directly

Open browser and visit:
- http://localhost:5000/health
- Should see: `{"status":"ok",...}`

If this fails, backend isn't running or port is wrong.

### Step 3: Check Frontend Configuration

Verify `frontend/.env.local` exists and has:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Important:** Restart frontend after changing `.env.local`:
```powershell
# Stop frontend (Ctrl+C)
npm run dev:frontend
```

### Step 4: Check Browser Console

Open browser DevTools (F12) → Console tab:
- Look for CORS errors
- Look for connection refused errors
- Check Network tab for failed requests

### Step 5: Test API Endpoint Directly

Try submitting via curl/Postman:
```powershell
curl -X POST http://localhost:5000/api/claims `
  -H "Content-Type: application/json" `
  -d '{"claim":"Test claim here"}'
```

## Common Issues

### Issue: Backend Not Running
**Solution:** Start backend: `npm run dev:backend`

### Issue: Port Already in Use
**Solution:** 
- Change port in `backend/.env`: `PORT=5001`
- Update `frontend/.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:5001/api`
- Restart both servers

### Issue: Frontend Not Reading .env.local
**Solution:**
- Make sure file is named exactly `.env.local` (not `.env`)
- Restart frontend dev server
- Check file is in `frontend/` directory

### Issue: CORS Error
**Solution:**
- Backend should have `app.use(cors())` (already configured)
- Check backend logs for CORS errors
- Verify backend is actually running

### Issue: Firewall/Antivirus Blocking
**Solution:**
- Temporarily disable firewall/antivirus
- Add exception for Node.js
- Check Windows Firewall settings

## Debug Steps

1. **Check Backend Logs:**
   - Look for incoming requests
   - Check for errors

2. **Check Frontend Network Tab:**
   - Open DevTools → Network
   - Submit claim
   - Look for failed request to `/api/claims`
   - Check status code and error message

3. **Test Backend Health:**
   ```powershell
   curl http://localhost:5000/health
   ```

4. **Verify Environment Variables:**
   ```powershell
   # Backend
   cd backend
   Get-Content .env | Select-String "PORT"
   
   # Frontend
   cd frontend
   Get-Content .env.local | Select-String "API_URL"
   ```

## Still Not Working?

1. **Restart Everything:**
   ```powershell
   # Stop all servers (Ctrl+C)
   # Then restart
   npm run dev
   ```

2. **Clear Browser Cache:**
   - Hard refresh: Ctrl+Shift+R
   - Or clear cache in browser settings

3. **Check for Typos:**
   - Verify URLs are correct
   - Check for extra spaces in .env files

4. **Check Node Version:**
   ```powershell
   node --version
   # Should be 18+
   ```

## Expected Behavior

When working correctly:
1. Submit claim → Shows "Submitting..."
2. Redirects to `/results/[id]`
3. Shows processing status
4. Updates when AI finishes

If you see "Network Error", backend connection failed.
