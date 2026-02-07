export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          🚀 Hackathon Starter
        </h1>
        <p className="text-center text-lg mb-4">
          Your hackathon project is ready to go!
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">⚡ Fast Setup</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get started in minutes with pre-configured tools
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">🔧 Modern Stack</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Next.js, TypeScript, Express, and more
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">🐳 Docker Ready</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Deploy anywhere with containerization
            </p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <a
            href="/api/health"
            className="text-blue-600 hover:underline"
            target="_blank"
          >
            Check API Health →
          </a>
        </div>
      </div>
    </main>
  );
}
