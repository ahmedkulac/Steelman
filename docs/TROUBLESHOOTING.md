# Troubleshooting Guide

## Issue: `npm run dev` does nothing

### Problem
The dev servers aren't starting because dependencies haven't been installed.

### Solution

1. **Install root dependencies:**
   ```bash
   npm install
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Or install all at once (from root):**
   ```bash
   npm install
   npm install --workspace=backend
   npm install --workspace=frontend
   ```

### After Installing Dependencies

1. **Set up environment variables** (see `PHASE1_SETUP.md`)

2. **Run database migrations:**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

3. **Start the dev servers:**
   ```bash
   npm run dev
   ```

## Common Issues

### Port Already in Use

**Error:** `Port 3000 is already in use` or `Port 5000 is already in use`

**Solution:**
- Kill the process using the port, or
- Change the port in `.env` files

### Database Connection Error

**Error:** `Can't reach database server`

**Solution:**
- Make sure PostgreSQL is running
- Check `DATABASE_URL` in `backend/.env`
- If using Docker: `docker-compose up -d postgres`

### Missing Environment Variables

**Error:** `OPENAI_API_KEY is not configured`

**Solution:**
- Create `backend/.env` file
- Add `OPENAI_API_KEY=sk-your-key-here`
- See `.env.example` for all required variables

### Module Not Found Errors

**Error:** `Cannot find module 'xyz'`

**Solution:**
- Run `npm install` in the workspace where the error occurs
- Delete `node_modules` and `package-lock.json`, then reinstall

### TypeScript Errors

**Error:** Type errors in IDE

**Solution:**
- Run `npm run type-check` to see all errors
- Make sure all dependencies are installed
- Run `npm run db:generate` if Prisma errors

## Still Having Issues?

1. Check the terminal output for specific error messages
2. Verify Node.js version: `node --version` (should be 18+)
3. Check if ports 3000 and 5000 are available
4. Ensure PostgreSQL is running
5. Verify all environment variables are set
