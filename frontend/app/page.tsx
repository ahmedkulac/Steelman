/**
 * Home Page
 * 
 * Main landing page of the Fact Checker application.
 * Features:
 * - Claim input form
 * - Information about the steelman technique
 * - Feature highlights
 * - Mobile-responsive design
 */

import ClaimInput from '@/components/ClaimInput';

/**
 * Home Page Component
 * 
 * Renders the main page with:
 * - Header and description
 * - Claim input form
 * - Feature information cards
 * - Footer disclaimer
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Fact Checker
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get steelman counter-arguments to help you critically evaluate
            claims. We present the strongest possible opposing viewpoints using
            AI.
          </p>
        </div>

        {/* Main Input Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 mb-8">
          <ClaimInput />
        </div>

        {/* Feature Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Steelman Technique Card */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
              🔍 Steelman Technique
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We present the strongest possible counter-arguments, not weak
              strawman versions
            </p>
          </div>

          {/* AI-Powered Card */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
              🤖 AI-Powered
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Advanced AI analyzes claims and generates thoughtful
              counter-arguments
            </p>
          </div>

          {/* Mobile-Friendly Card */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
              📱 Mobile-Friendly
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Optimized for mobile devices with a clean, responsive interface
            </p>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            This tool is designed to help you think critically. Always verify
            information from multiple sources.
          </p>
        </div>
      </div>
    </main>
  );
}
