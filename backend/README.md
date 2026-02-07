# Backend

Express.js API server with TypeScript, Prisma, and PostgreSQL.

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
│   ├── middleware/    # Express middleware
│   ├── controllers/   # Business logic
│   ├── services/      # Service layer
│   ├── utils/         # Utility functions
│   └── index.ts       # Entry point
├── prisma/            # Prisma schema and migrations
└── dist/              # Compiled JavaScript (generated)
```

## Database Setup

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

## Environment Variables

Create a `.env` file:

```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/hackathon_db?schema=public
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

## API Endpoints

- `GET /health` - Health check
- `GET /api` - API information
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user

## Features

- ⚡ Express.js with TypeScript
- 🗄️ Prisma ORM for database
- 🔐 JWT authentication ready
- 🛡️ Security middleware (Helmet, CORS)
- 📝 Request logging (Morgan)
- ✅ Input validation with Zod
