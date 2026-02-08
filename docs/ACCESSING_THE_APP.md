# How to Access the Fact Checker App

## URLs

### Frontend (Main App)
**http://localhost:3000**

This is where you interact with the app - submit claims, view results, etc.

### Backend API
**http://localhost:5000**

- Root: http://localhost:5000/ (API info)
- Health: http://localhost:5000/health (health check)
- API: http://localhost:5000/api (API endpoints info)
- Claims: http://localhost:5000/api/claims (claims endpoints)

## Starting the App

### Option 1: Start Both Together (Recommended)

```powershell
npm run dev
```

This starts:
- Frontend on http://localhost:3000
- Backend on http://localhost:5000

### Option 2: Start Separately

**Terminal 1 - Backend:**
```powershell
npm run dev:backend
```

**Terminal 2 - Frontend:**
```powershell
npm run dev:frontend
```

## What You Should See

### Frontend (http://localhost:3000)
- Fact Checker homepage
- Input form to submit claims
- Results page after submitting

### Backend (http://localhost:5000)
- API information
- Health status

### Backend API (http://localhost:5000/api)
- List of available endpoints
- API version info

## Troubleshooting

### "Route / not found"
- You're accessing the backend directly
- Use http://localhost:3000 for the frontend instead
- Or use http://localhost:5000/api for API endpoints

### Frontend shows errors
- Make sure backend is running on port 5000
- Check browser console for errors
- Verify `NEXT_PUBLIC_API_URL` in `frontend/.env.local`

### Backend not starting
- Check if port 5000 is available
- Verify database is set up (SQLite should work automatically)
- Check backend logs for errors

## Testing the App

1. **Open http://localhost:3000** in your browser
2. **Enter a claim** (e.g., "Climate change is not real")
3. **Click "Fact-Check Claim"**
4. **Wait for results** (may take a few seconds for AI processing)
5. **View steelman counter-arguments**

## API Testing

You can test the API directly:

```powershell
# Health check
curl http://localhost:5000/health

# Submit a claim
curl -X POST http://localhost:5000/api/claims \
  -H "Content-Type: application/json" \
  -d '{"claim":"Test claim here"}'
```
