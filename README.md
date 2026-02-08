# Steelman - Perspective Engine

A modern web application that helps users fact-check claims by generating steelman counter-arguments using AI. The app uses the steelman technique - presenting the strongest possible version of an opposing argument - to help users critically evaluate information and change their perspectives through evidence-based counter-arguments.

**Status:** ✅ Production Ready | **Version:** Final

## 🎯 Features

- **AI-Powered Fact-Checking**: Uses Google Gemini AI to generate steelman counter-arguments
- **Mobile-First Design**: Optimized for mobile devices with responsive UI
- **Real-Time Processing**: Asynchronous AI processing with status updates
- **Multi-Tier Caching**: Redis + in-memory backend cache + frontend localStorage cache
- **Rate Limiting**: Protects API usage and prevents abuse
- **Free Tier Optimized**: Configured for Google Gemini free tier

## 🚀 Quick Start

### Quick Deploy (Recommended)

**Frontend:** Vercel | **Backend:** Railway | **Database:** Supabase

1. **Set up Supabase database:** [Quick Start Guide](./docs/SUPABASE_QUICK_START.md)
2. **Deploy backend:** Railway with Supabase connection
3. **Deploy frontend:** Vercel

See [Supabase Setup Guide](./docs/SUPABASE_SETUP.md) for complete instructions.

### Deploy to Vercel (Frontend)

**One-click deploy:**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/3Mis1Cs&root-directory=frontend)

Or follow the [Vercel Deployment Guide](./docs/VERCEL_DEPLOYMENT.md)

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API key (free tier available)

### Installation

#### Option 1: Automated Setup (Recommended)

**Windows:**
```powershell
.\scripts\setup.ps1
```

**Mac/Linux:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

#### Option 2: Manual Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd 3Mis1Cs
   npm install
   ```

2. **Set up environment variables:**
   
   **Backend:**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env and add your GOOGLE_API_KEY
   ```
   
   **Frontend:**
   ```bash
   cp frontend/.env.local.example frontend/.env.local
   # Usually no changes needed unless backend runs on different port
   ```

3. **Google API Key:**
   - A shared API key is already in `backend/.env.example`
   - Or get your own from: https://makersuite.google.com/app/apikey
   - The setup script will copy it automatically

4. **Generate Prisma client:**
   ```bash
   npm run db:generate
   ```

5. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

6. **Start development servers:**
   ```bash
   npm run dev
   ```

## 📍 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/health
- **API Info**: http://localhost:5000/api

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Backend
- **Express.js** - Node.js web framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **SQLite** - Development database (no setup required!)
- **Google Gemini API** - AI-powered counter-arguments
- **Redis** - Optional caching

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start all services
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run database migrations
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
├── frontend/              # Next.js frontend application
│   ├── app/              # Pages and routes
│   ├── components/       # React components
│   └── lib/             # API client and utilities
├── backend/              # Express.js backend API
│   ├── src/
│   │   ├── routes/      # API route handlers
│   │   ├── services/    # Business logic (AI service)
│   │   ├── utils/       # Utilities (cache, rate limit)
│   │   └── middleware/  # Express middleware
│   └── prisma/          # Database schema
├── docs/                 # Documentation
├── scripts/             # Setup scripts
└── README.md            # This file
```

## 🔧 Configuration

### Required Environment Variables

**Backend (`backend/.env`):**
```env
GOOGLE_API_KEY=your-google-api-key-here  # REQUIRED
DATABASE_URL="file:./dev.db"              # SQLite (default)
AI_MODEL=gemini-2.5-flash                 # Optional
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

See `backend/.env.example` and `frontend/.env.local.example` for all options.

## 🗄️ Database

The app uses **SQLite by default** (no setup required!). The database file (`backend/dev.db`) is created automatically on first migration.

To switch to PostgreSQL:
1. Update `DATABASE_URL` in `backend/.env`
2. Update `backend/prisma/schema.prisma` datasource
3. Run migrations: `npm run db:migrate`

## 📚 Documentation

- [Setup Guide](./docs/PHASE1_SETUP.md) - Detailed setup instructions
- [API Documentation](./docs/API.md) - API endpoints reference
- [Development Plan](./docs/FACT_CHECKER_PLAN.md) - Full project plan
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - Common issues and fixes
- [Google API Setup](./docs/GOOGLE_API_SETUP.md) - Gemini API configuration

## 🐛 Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Verify `GOOGLE_API_KEY` is set in `backend/.env`
- Check backend logs for errors

### Frontend shows "Network Error"
- Make sure backend is running on port 5000
- Verify `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
- Check browser console for detailed errors

### Database errors
- Run `npm run db:generate` to regenerate Prisma client
- Run `npm run db:migrate` to create database tables
- SQLite database is created automatically (no setup needed!)

See [Troubleshooting Guide](./docs/TROUBLESHOOTING.md) for more help.

## 🎯 How It Works

1. **User submits a claim** via the web interface
2. **Backend validates** the claim and checks cache
3. **AI generates** steelman counter-arguments (if not cached)
4. **Results displayed** with confidence scores and evidence
5. **User can provide feedback** on the counter-arguments

## 🔒 Security

- Environment variables are **never committed** to git
- `.env` files are in `.gitignore`
- API keys are stored server-side only
- Rate limiting prevents abuse
- Input validation on all endpoints

## 🚀 Deployment

### Frontend (Vercel)

**Quick Deploy:**
1. Go to https://vercel.com/new
2. Import GitHub repository
3. Set **Root Directory** to `frontend`
4. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-url/api`
5. Deploy!

See [Vercel Deployment Guide](./docs/VERCEL_DEPLOYMENT.md) for detailed instructions.

### Backend (Railway/Render + Supabase)

Deploy backend with Supabase database:
- **Database**: Supabase (free PostgreSQL)
- **Backend Hosting**: Railway (recommended) or Render
- **Setup Guide**: [Supabase Setup Guide](./docs/SUPABASE_SETUP.md)

See [Free Deployment Guide](./docs/FREE_DEPLOYMENT_GUIDE.md) for all options.

## 📄 License

MIT License - feel free to use this for your projects!

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

**Built with ❤️ for critical thinking and fact-checking**
