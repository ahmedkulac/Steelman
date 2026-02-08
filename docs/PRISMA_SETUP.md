# Prisma Setup Guide

## Issue: Prisma Client Not Generated

If you see the error: `@prisma/client did not initialize yet. Please run "prisma generate"`

### Solution

Run these commands from the project root:

```powershell
# Generate Prisma client
npm run db:generate

# Run database migrations (if database is set up)
npm run db:migrate
```

### If You Get Permission Errors

**Option 1: Run as Administrator**
1. Close your current terminal
2. Right-click PowerShell → "Run as Administrator"
3. Navigate to project: `cd C:\Users\Ahmed\OneDrive\Documents\GitHub\3Mis1Cs`
4. Run: `npm run db:generate`

**Option 2: Close Locked Files**
- Close any IDEs or processes that might be using Prisma files
- Try again

**Option 3: Delete and Regenerate**
```powershell
# Delete Prisma client
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue

# Regenerate
npm run db:generate
```

### After Generating Prisma Client

Once `prisma generate` succeeds, you should be able to start the backend:

```powershell
npm run dev:backend
```

### Database Setup (If Not Done Yet)

Before running migrations, make sure PostgreSQL is running:

```powershell
# If using Docker
docker-compose up -d postgres

# Then run migrations
npm run db:migrate
```

### Verify Prisma Client

After generating, you should see:
- `node_modules/.prisma/client/` directory created
- No errors when importing `@prisma/client`
