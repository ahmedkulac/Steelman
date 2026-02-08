# Phase 1 Setup Guide

This guide will help you set up and run the Fact Checker app Phase 1 MVP.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (via Docker or local installation)
- Redis (optional, for caching - via Docker or local installation)
- Google Gemini API key (get from https://makersuite.google.com/app/apikey)

## Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: Set Up Environment Variables

### Backend (.env)

Create a `.env` file in the `backend` directory:

```env
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hackathon_db?schema=public

# JWT (for future auth)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Redis (optional - caching will be disabled if not available)
REDIS_URL=redis://localhost:6379

# AI Service - Google Gemini API
# Get your API key from: https://makersuite.google.com/app/apikey
GOOGLE_API_KEY=your-google-api-key-here
# Alternative: GEMINI_API_KEY (either works)
# GEMINI_API_KEY=your-api-key-here
AI_MODEL=gemini-1.5-flash
AI_MAX_TOKENS=2000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=10
```

### Frontend (.env.local)

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Set Up Database

### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis
```

### Option B: Local Installation

Make sure PostgreSQL is running locally and update `DATABASE_URL` accordingly.

## Step 4: Run Database Migrations

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate
```

## Step 5: Start Development Servers

### Option A: Start Both Together (Recommended)

```bash
npm run dev
```

This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:5000

### Option B: Start Separately

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

## Step 6: Verify Setup

1. **Check Backend Health:**
   - Visit http://localhost:5000/health
   - Should return: `{"status":"ok",...}`

2. **Check Frontend:**
   - Visit http://localhost:3000
   - Should see the Fact Checker home page

3. **Test API:**
   - Visit http://localhost:5000/api
   - Should see API information

## Testing the App

1. **Submit a Claim:**
   - Go to http://localhost:3000
   - Enter a claim (e.g., "Climate change is not caused by human activity")
   - Optionally select a category
   - Click "Fact-Check Claim"

2. **View Results:**
   - You'll be redirected to the results page
   - If processing, the page will auto-refresh every 3 seconds
   - Once complete, you'll see the steelman counter-arguments

## Troubleshooting

### Database Connection Issues

- Make sure PostgreSQL is running
- Check `DATABASE_URL` in `.env` is correct
- Try: `docker-compose up -d postgres` if using Docker

### Redis Connection Issues

- Redis is optional - the app will work without it (caching disabled)
- If you see Redis warnings, that's fine for development
- To enable: `docker-compose up -d redis`

### Google Gemini API Errors

- Make sure `GOOGLE_API_KEY` or `GEMINI_API_KEY` is set in backend `.env`
- Get your API key from: https://makersuite.google.com/app/apikey
- Verify your API key is valid and has quota available
- Check API rate limits if you hit errors
- Make sure you've enabled the Gemini API in Google Cloud Console

### Port Already in Use

- Change `PORT` in backend `.env` if 5000 is taken
- Change Next.js port: `npm run dev:frontend -- -p 3001`

### Prisma Migration Issues

- If schema changes, run: `npm run db:migrate`
- Reset database (dev only): `npx prisma migrate reset`

## Next Steps

Once Phase 1 is working:

1. Test with various claims
2. Check rate limiting (try submitting more than 10 claims/hour)
3. Verify caching works (submit same claim twice)
4. Review the generated counter-arguments for quality

## Development Tips

- Use Prisma Studio to view database: `npm run db:studio`
- Check backend logs for AI service responses
- Use browser DevTools to debug frontend issues
- Check Network tab to see API calls

## API Endpoints

- `POST /api/claims` - Submit a new claim
- `GET /api/claims/:id` - Get claim results
- `GET /api/claims` - List claims (with pagination)
- `POST /api/claims/:id/feedback` - Submit feedback

## Notes

- AI processing happens asynchronously - claims return immediately with "processing" status
- Results page polls for updates every 3 seconds while processing
- Rate limiting: 10 requests/hour per IP (configurable)
- Caching: Identical claims are cached for 7 days
