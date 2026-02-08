# Quick Network Error Fix

## Most Common Cause: Backend Not Running

The "Network Error" usually means the backend server isn't running.

## Quick Fix (30 seconds)

### Step 1: Check if Backend is Running

Look at your terminal - do you see this?
```
🚀 Server running on http://localhost:5000
```

**If NO:** Backend isn't running. Go to Step 2.

**If YES:** Backend is running. Go to Step 3.

### Step 2: Start Backend

```powershell
npm run dev:backend
```

Wait for: `🚀 Server running on http://localhost:5000`

### Step 3: Test Backend Connection

Open browser and visit: **http://localhost:5000/health**

**Should see:** `{"status":"ok",...}`

**If you see an error:** Backend isn't running properly.

### Step 4: Restart Frontend (if needed)

If you changed anything, restart frontend:
```powershell
# Stop frontend (Ctrl+C)
npm run dev:frontend
```

## Still Getting Network Error?

### Check 1: Verify Backend Port

Backend should be on port 5000. Check `backend/.env`:
```env
PORT=5000
```

### Check 2: Verify Frontend API URL

Frontend should point to backend. Check `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Important:** Restart frontend after changing `.env.local`!

### Check 3: Both Servers Running?

You need BOTH running:
- Backend: `npm run dev:backend` (port 5000)
- Frontend: `npm run dev:frontend` (port 3000)

Or run both: `npm run dev`

### Check 4: Browser Console

Open browser DevTools (F12) → Console tab:
- Look for error messages
- Check Network tab → Find failed request → See error details

## Test Backend Manually

Try this in PowerShell:
```powershell
curl http://localhost:5000/health
```

Should return: `{"status":"ok",...}`

If this fails, backend isn't running.

## Still Not Working?

1. **Restart everything:**
   ```powershell
   # Stop all (Ctrl+C in all terminals)
   npm run dev
   ```

2. **Check firewall:** Windows Firewall might be blocking Node.js

3. **Check antivirus:** Might be blocking localhost connections

4. **Try different browser:** Sometimes browser cache causes issues

## Expected Flow

1. ✅ Backend running → `http://localhost:5000/health` works
2. ✅ Frontend running → `http://localhost:3000` loads
3. ✅ Submit claim → No network error
4. ✅ Redirects to results page

If step 3 fails, backend isn't reachable from frontend.
