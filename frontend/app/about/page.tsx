/**
 * About Page
 * 
 * Provides information about Steelman, the technique, and how the application works.
 */

'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-black py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black text-black dark:text-white tracking-tighter uppercase mb-4">
            About Steelman
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Understanding the art of critical thinking through stronger arguments
          </p>
        </div>

        {/* Important Note */}
        <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 md:p-8 border border-blue-200 dark:border-blue-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Important Disclaimer
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              <strong className="text-gray-900 dark:text-gray-100">This application is designed for critical thinking and educational purposes.</strong> The AI-generated counter-arguments are tools to help you evaluate claims, but they should not be considered definitive truth.
            </p>
            <p>
              Always verify information independently, consult multiple sources, and use your own judgment. The goal is to think more critically, not to replace your own reasoning with AI-generated content.
            </p>
            <p className="text-sm italic">
              Designed for critical thinking. Verify all information.
            </p>
          </div>
        </section>

        {/* What is Steelman */}
        <section className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 md:p-8 border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            What is a Steelman Argument?
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              A <strong className="text-gray-900 dark:text-gray-100">steelman argument</strong> is the practice of constructing the strongest, most persuasive version of an opponent's argument. It is the opposite of a <strong className="text-gray-900 dark:text-gray-100">strawman argument</strong>, which misrepresents or weakens an opponent's position to make it easier to attack.
            </p>
            <p>
              The steelman technique encourages intellectual honesty and critical thinking by:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Presenting the best possible version of an opposing viewpoint</li>
              <li>Engaging with the strongest aspects of a claim, not the weakest</li>
              <li>Using evidence-based reasoning and verifiable facts</li>
              <li>Acknowledging when an argument has merit</li>
              <li>Challenging ideas directly and honestly</li>
            </ul>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 md:p-8 border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            How This Application Works
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              This application uses AI-powered analysis to help you critically evaluate claims and statements. Here's how it works:
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">1. Submit a Claim</h3>
                <p>
                  Enter a claim, statement, or article URL that you want to fact-check. You can also provide additional context or select a category to help the AI understand the topic better.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">2. AI Analysis</h3>
                <p>
                  Our AI analyzes the claim and generates powerful, evidence-based counter-arguments. These counter-arguments are designed to challenge the claim directly with facts, logic, and verifiable evidence.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">3. Review Counter-Arguments</h3>
                <p>
                  Review the generated counter-arguments, each with:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>A direct, evidence-based counter-argument</li>
                  <li>Reasoning explaining why it's compelling</li>
                  <li>Supporting evidence points</li>
                  <li>A strength rating (1-10)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">4. Think Critically</h3>
                <p>
                  Use these counter-arguments to evaluate the original claim more carefully. The goal is not to "win" an argument, but to understand different perspectives and make more informed decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why It Matters */}
        <section className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 md:p-8 border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Why Steelman Arguments Matter
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              In an age of information overload and polarized discourse, steelman arguments help us:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-gray-900 dark:text-gray-100">Avoid echo chambers:</strong> Challenge our own beliefs by engaging with the strongest opposing views</li>
              <li><strong className="text-gray-900 dark:text-gray-100">Make better decisions:</strong> Consider multiple perspectives before forming conclusions</li>
              <li><strong className="text-gray-900 dark:text-gray-100">Improve critical thinking:</strong> Develop skills in evaluating evidence and reasoning</li>
              <li><strong className="text-gray-900 dark:text-gray-100">Foster intellectual honesty:</strong> Acknowledge when arguments have merit, even if we disagree</li>
              <li><strong className="text-gray-900 dark:text-gray-100">Engage constructively:</strong> Have more productive conversations by addressing the strongest points</li>
            </ul>
          </div>
        </section>

        {/* Back to Home */}
        <div className="text-center pt-8">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-black font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg min-h-[44px] touch-manipulation"
          >
            <svg
              className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
