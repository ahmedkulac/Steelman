# Quick Start with SQLite

I've configured your project to use SQLite for development. This requires **zero setup** - no Docker, no PostgreSQL installation!

## Next Steps

1. **Generate Prisma Client:**
   ```powershell
   npm run db:generate
   ```
   (Run PowerShell as Administrator if you get permission errors)

2. **Create Database Tables:**
   ```powershell
   npm run db:migrate
   ```
   When prompted, name it: `init`

3. **Start the Backend:**
   ```powershell
   npm run dev:backend
   ```

4. **Start the Frontend** (in another terminal):
   ```powershell
   npm run dev:frontend
   ```

5. **Test the App:**
   - Open http://localhost:3000
   - Submit a test claim!

## What Changed

- Database: SQLite (file-based, no server needed)
- Database file: `backend/dev.db` (created automatically)
- No Docker or PostgreSQL required

## Switching to PostgreSQL Later

When you're ready for PostgreSQL:

1. **Install Docker** or **PostgreSQL locally**

2. **Update `backend/prisma/schema.prisma`:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Update `backend/.env`:**
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/hackathon_db?schema=public
   ```

4. **Run migrations again:**
   ```powershell
   npm run db:generate
   npm run db:migrate
   ```

## SQLite Limitations

- ✅ Perfect for development and testing
- ✅ Zero setup required
- ❌ Not recommended for production
- ❌ Limited concurrent writes
- ❌ No advanced PostgreSQL features

For now, SQLite will let you develop and test the app immediately!
