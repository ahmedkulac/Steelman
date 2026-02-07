# Hackathon Starter Template

A comprehensive starter template for hackathons with modern tooling and best practices.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Docker (optional, for containerized deployment)

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development servers:**
   ```bash
   # Start frontend and backend together
   npm run dev
   
   # Or start separately:
   npm run dev:frontend  # Frontend on http://localhost:3000
   npm run dev:backend   # Backend on http://localhost:5000
   ```

## 📁 Project Structure

```
.
├── frontend/          # Next.js frontend application
├── backend/           # Express.js backend API
├── docs/              # Documentation and resources
├── docker-compose.yml # Docker orchestration
└── README.md          # This file
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Component library

### Backend
- **Express.js** - Node.js web framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **JWT** - Authentication

### Database
- **PostgreSQL** - Primary database (via Docker)
- **Redis** - Caching (optional)

## 📝 Available Scripts

- `npm run dev` - Start all services in development mode
- `npm run build` - Build for production
- `npm run start` - Start production servers
- `npm run lint` - Run linters
- `npm run test` - Run tests
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## 🐳 Docker

Run the entire stack with Docker:

```bash
docker-compose up -d
```

## 📚 Documentation

- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)
- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - feel free to use this template for your hackathon project!

## 🎯 Hackathon Tips

1. **Start Simple**: Get a basic MVP working first
2. **Version Control**: Commit early and often
3. **Documentation**: Keep notes on decisions and setup
4. **Testing**: Test your deployment before the deadline
5. **Presentation**: Prepare your demo and pitch

---

Built with ❤️ for hackathons
