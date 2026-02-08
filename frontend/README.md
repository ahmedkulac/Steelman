# Frontend - Fact Checker App

Next.js 14 application with TypeScript and Tailwind CSS.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page (claim input)
│   ├── results/[id]/     # Results page (dynamic route)
│   ├── api/health/       # Health check API route
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── ClaimInput.tsx    # Main claim submission form
│   ├── SteelmanResult.tsx # Results display component
│   ├── ConfidenceBadge.tsx # Confidence score visualization
│   ├── EvidenceList.tsx  # Evidence display component
│   ├── Header.tsx        # App header with navigation
│   └── ThemeToggle.tsx   # Dark/light mode toggle button
├── contexts/              # React contexts
│   └── ThemeContext.tsx  # Theme management context
├── scripts/               # Utility scripts
│   └── predev-cleanup.js # Pre-dev cleanup script
├── lib/                   # Utility functions and API clients
│   ├── api.ts            # Axios instance configuration
│   └── api/claims.ts     # Claims API client functions
└── public/               # Static assets
```

## Features

- ⚡ Next.js 14 with App Router
- 🎨 Tailwind CSS for styling
- 📘 TypeScript for type safety
- 📱 Mobile-responsive design
- 🌙 Dark mode support
- 🔄 React Hook Form for form handling
- ✅ Zod validation
- 🎯 Auto-polling for claim status

## Environment Variables

Copy `frontend/.env.local.example` to `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note:** Restart dev server after changing `.env.local`!

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type check
npm run type-check

# Lint
npm run lint
```

## Key Components

### ClaimInput
Main form component for submitting claims. Features:
- Form validation (React Hook Form + Zod)
- Character counter
- Category selection
- Optional context field
- Error handling

### SteelmanResult
Displays fact-checking results. Features:
- Processing status indicators
- Counter-arguments display
- Confidence scores
- Evidence lists
- Error states

### ResultsPage
Dynamic route page that:
- Fetches claim results
- Auto-polls while processing
- Handles loading/error states
- Displays results

## API Integration

The frontend communicates with the backend via:
- `lib/api.ts` - Axios instance with interceptors
- `lib/api/claims.ts` - Type-safe API functions

All API calls are type-safe with TypeScript interfaces.

## Styling

- **Tailwind CSS** - Utility-first CSS framework
- **Dark Mode** - Automatic based on system preference
- **Mobile-First** - Responsive design optimized for mobile
- **Custom CSS Variables** - For theming support

## Documentation

See [docs/](../docs/) folder for detailed documentation:
- [Setup Guide](../docs/PHASE1_SETUP.md)
- [API Documentation](../docs/API.md)
- [Troubleshooting](../docs/TROUBLESHOOTING.md)
