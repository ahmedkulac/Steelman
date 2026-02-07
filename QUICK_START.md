# Quick Start Guide

Get your hackathon project running in 5 minutes!

## 🚀 Fast Setup

### Option 1: Using Setup Scripts

**Windows (PowerShell):**
```powershell
.\scripts\setup.ps1
```

**Mac/Linux:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Option 2: Manual Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start database (Docker):**
   ```bash
   docker-compose up -d postgres
   ```

4. **Run migrations:**
   ```bash
   npm run db:migrate
   ```

5. **Start dev servers:**
   ```bash
   npm run dev
   ```

## 📍 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/health
- **Prisma Studio**: Run `npm run db:studio`

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Start all services
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio

# Build & Deploy
npm run build           # Build for production
npm run start           # Start production servers

# Code Quality
npm run lint            # Run linters
npm run type-check      # TypeScript type checking
```

## 📁 Project Structure

```
.
├── frontend/          # Next.js app (port 3000)
│   ├── app/          # Pages and routes
│   ├── components/   # React components
│   └── lib/         # Utilities
├── backend/          # Express API (port 5000)
│   ├── src/         # Source code
│   └── prisma/      # Database schema
├── docs/            # Documentation
└── scripts/         # Setup scripts
```

## 🔧 Quick Customization

### Add a New API Route

1. Create file: `backend/src/routes/your-route.ts`
2. Add route handler
3. Import in `backend/src/routes/index.ts`

### Add a New Page

1. Create file: `frontend/app/your-page/page.tsx`
2. Export default component
3. Access at `/your-page`

### Add Database Model

1. Edit `backend/prisma/schema.prisma`
2. Run `npm run db:generate`
3. Run `npm run db:migrate`

## 🐛 Troubleshooting

**Port already in use?**
- Change ports in `.env` or kill the process

**Database connection error?**
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running: `docker-compose ps`

**Module not found?**
- Run `npm install` in the specific workspace
- Check if package is in the correct `package.json`

**TypeScript errors?**
- Run `npm run type-check` to see all errors
- Ensure types are installed: `@types/package-name`

## 📚 Need Help?

- Check [README.md](./README.md) for detailed docs
- See [docs/HACKATHON_TIPS.md](./docs/HACKATHON_TIPS.md) for hackathon advice
- Review [docs/API.md](./docs/API.md) for API reference

---

**Ready to build? Start coding! 🎉**
