# Backend - Fact Checker API

Express.js API server with TypeScript, Prisma, and SQLite/PostgreSQL.

## Getting Started

```bash
npm install
npm run dev
```

The API will be available at [http://localhost:5000](http://localhost:5000)

## Project Structure

```
backend/
├── src/
│   ├── routes/        # API route handlers
│   │   ├── claims.ts  # Claim fact-checking endpoints
│   │   ├── users.ts   # User endpoints (placeholder)
│   │   └── index.ts   # Route aggregator
│   ├── services/      # Business logic
│   │   └── aiService.ts  # Google Gemini AI integration
│   ├── utils/         # Utility functions
│   │   ├── cache.ts   # Redis caching
│   │   └── rateLimit.ts  # Rate limiting
│   ├── middleware/    # Express middleware
│   │   ├── errorHandler.ts
│   │   └── notFoundHandler.ts
│   └── index.ts       # Entry point
├── prisma/            # Prisma schema and migrations
└── dist/              # Compiled JavaScript (generated)
```

## Database Setup

### SQLite (Default - No Setup Required!)

The app uses SQLite by default - no database installation needed!

1. **Generate Prisma Client:**
   ```bash
   npm run db:generate
   ```

2. **Run Migrations:**
   ```bash
   npm run db:migrate
   ```

3. **Open Prisma Studio (optional):**
   ```bash
   npm run db:studio
   ```

### PostgreSQL (Optional)

To use PostgreSQL instead:

1. Update `prisma/schema.prisma` datasource to `postgresql`
2. Update `DATABASE_URL` in `.env`
3. Run migrations

## Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```env
PORT=5000
NODE_ENV=development

# Database (SQLite by default)
DATABASE_URL="file:./dev.db"

# Google Gemini API (required)
GOOGLE_API_KEY=your-api-key-here

# AI Configuration
AI_MODEL=gemini-2.5-flash
AI_MAX_TOKENS=2000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=10

# Redis (optional)
REDIS_ENABLED=false
REDIS_URL=redis://localhost:6379
```

## API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `GET /api` - API endpoints list
- `POST /api/claims` - Submit a claim for fact-checking
- `GET /api/claims/:id` - Get claim results
- `GET /api/claims` - List claims (with pagination)
- `POST /api/claims/:id/feedback` - Submit feedback

## Features

- ⚡ Express.js with TypeScript
- 🗄️ Prisma ORM (SQLite/PostgreSQL)
- 🤖 Google Gemini AI integration
- 🔐 JWT authentication ready
- 🛡️ Security middleware (Helmet, CORS)
- 📝 Request logging (Morgan)
- ✅ Input validation with Zod
- 🚦 Rate limiting
- 💾 Optional Redis caching

## Development

```bash
# Start dev server
npm run dev

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio

# Type check
npm run type-check

# Lint
npm run lint
```

## Documentation

See [docs/](../docs/) folder for detailed documentation:
- [API Documentation](../docs/API.md)
- [Setup Guide](../docs/PHASE1_SETUP.md)
- [Troubleshooting](../docs/TROUBLESHOOTING.md)
