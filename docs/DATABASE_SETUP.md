# Database Setup Guide

## Quick Setup with Docker (Recommended)

### Step 1: Start PostgreSQL Database

From the project root directory:

```powershell
docker-compose up -d postgres
```

This will:
- Download PostgreSQL 16 (if not already downloaded)
- Start a PostgreSQL container
- Create a database called `hackathon_db`
- Set up user: `user` / password: `password`
- Expose on port `5432`

### Step 2: Verify Database is Running

```powershell
docker ps
```

You should see `hackathon-postgres` container running.

### Step 3: Generate Prisma Client

```powershell
npm run db:generate
```

**Note:** If you get permission errors, run PowerShell as Administrator.

### Step 4: Run Database Migrations

This creates the tables (Claim, Feedback, User) in your database:

```powershell
npm run db:migrate
```

When prompted for a migration name, you can use: `init` or `initial_schema`

### Step 5: Verify Setup

```powershell
# Check database connection
npm run db:studio
```

This opens Prisma Studio where you can view your database tables in a browser.

## Your Database Configuration

- **Host:** localhost
- **Port:** 5432
- **Database:** hackathon_db
- **User:** user
- **Password:** password
- **Connection String:** Already configured in `backend/.env`

## Troubleshooting

### Docker Not Running
- Make sure Docker Desktop is installed and running
- Check: `docker --version`

### Port 5432 Already in Use
- Another PostgreSQL instance might be running
- Stop it or change the port in `docker-compose.yml`

### Permission Errors
- Run PowerShell as Administrator
- Or close any IDEs/processes that might be locking files

### Can't Connect to Database
- Verify container is running: `docker ps`
- Check logs: `docker logs hackathon-postgres`
- Restart: `docker-compose restart postgres`

## Optional: Start Redis (for Caching)

```powershell
docker-compose up -d redis
```

Redis is optional - the app will work without it (caching will be disabled).

## Stop Database

```powershell
docker-compose stop postgres
```

## Remove Database (WARNING: Deletes all data)

```powershell
docker-compose down -v
```

## Alternative: Local PostgreSQL Installation

If you prefer not to use Docker:

1. Install PostgreSQL locally
2. Create database: `createdb hackathon_db`
3. Update `DATABASE_URL` in `backend/.env` with your local credentials
4. Run migrations: `npm run db:migrate`
