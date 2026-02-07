# Frontend

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
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/             # Utility functions and API clients
├── public/          # Static assets
└── styles/          # Global styles
```

## Features

- ⚡ Next.js 14 with App Router
- 🎨 Tailwind CSS for styling
- 📘 TypeScript for type safety
- 🔄 Axios for API calls
- 🗃️ Zustand for state management (optional)

## Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
