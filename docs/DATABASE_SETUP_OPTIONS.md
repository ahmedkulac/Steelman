# Database Setup Options

Since Docker isn't installed, here are your options:

## Option 1: Install Docker Desktop (Recommended - Easiest)

### Steps:
1. **Download Docker Desktop:**
   - Visit: https://www.docker.com/products/docker-desktop/
   - Download for Windows
   - Install and restart your computer

2. **Start Docker Desktop** (it should start automatically)

3. **Start PostgreSQL:**
   ```powershell
   docker-compose up -d postgres
   ```

4. **Generate Prisma Client:**
   ```powershell
   npm run db:generate
   ```

5. **Run Migrations:**
   ```powershell
   npm run db:migrate
   ```

**Pros:** Easy, isolated, matches production setup  
**Cons:** Requires Docker installation (~500MB)

---

## Option 2: Install PostgreSQL Locally

### Steps:
1. **Download PostgreSQL:**
   - Visit: https://www.postgresql.org/download/windows/
   - Download installer
   - Install (remember the password you set!)

2. **Create Database:**
   ```powershell
   # Open PostgreSQL command line (psql)
   # Or use pgAdmin (GUI tool that comes with PostgreSQL)
   
   # In psql:
   CREATE DATABASE hackathon_db;
   ```

3. **Update `.env` file:**
   ```env
   DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/hackathon_db?schema=public
   ```
   Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your PostgreSQL credentials.

4. **Generate Prisma Client:**
   ```powershell
   npm run db:generate
   ```

5. **Run Migrations:**
   ```powershell
   npm run db:migrate
   ```

**Pros:** No Docker needed, direct database access  
**Cons:** Requires PostgreSQL installation and setup

---

## Option 3: Use Free Cloud Database (No Installation!)

### Option 3A: Supabase (Recommended)

1. **Sign up:** https://supabase.com (free tier available)

2. **Create a new project**

3. **Get connection string:**
   - Go to Project Settings → Database
   - Copy the "Connection string" (URI format)

4. **Update `backend/.env`:**
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

5. **Generate Prisma Client:**
   ```powershell
   npm run db:generate
   ```

6. **Run Migrations:**
   ```powershell
   npm run db:migrate
   ```

### Option 3B: Neon (Serverless PostgreSQL)

1. **Sign up:** https://neon.tech (free tier available)

2. **Create a new project**

3. **Get connection string** from dashboard

4. **Update `backend/.env`** with the connection string

5. **Generate and migrate** (same as above)

**Pros:** No installation, free tier, works anywhere  
**Cons:** Requires internet connection, slight latency

---

## Option 4: SQLite (Simplest - No Setup!)

For development/testing, you can use SQLite (no server needed):

1. **Update `backend/prisma/schema.prisma`:**
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```

2. **Update `backend/.env`:**
   ```env
   DATABASE_URL="file:./dev.db"
   ```

3. **Generate and migrate:**
   ```powershell
   npm run db:generate
   npm run db:migrate
   ```

**Pros:** Zero setup, works immediately  
**Cons:** Not suitable for production, limited features

---

## Recommendation

- **For quick start:** Option 4 (SQLite) - get running in 2 minutes
- **For learning:** Option 1 (Docker) - matches production
- **For sharing:** Option 3 (Cloud) - works on any machine

---

## After Setup

Once your database is configured:

1. **Start backend:**
   ```powershell
   npm run dev:backend
   ```

2. **Start frontend (in another terminal):**
   ```powershell
   npm run dev:frontend
   ```

3. **Test the app:**
   - Open http://localhost:3000
   - Submit a test claim
