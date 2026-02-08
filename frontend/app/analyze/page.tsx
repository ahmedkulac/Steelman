
'use client';

import React, { useState } from 'react';
import { analyzeUrl } from '@/lib/api/analyze';
import Link from 'next/link';

interface AnalyzedClaim {
    claim: string;
    quote: string;
    counterArgument: string;
    reasoning: string;
    source?: string;
    strength: number;
}

interface AnalysisResult {
    title: string;
    byline?: string;
    excerpt?: string;
    content: string;
    analysis: {
        summary: string;
        claims: AnalyzedClaim[];
        biasScore: number;
        biasAnalysis: string;
    };
}

export default function AnalyzePage() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<AnalysisResult | null>(null);

    // Check for result from sessionStorage (redirected from ClaimInput)
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedResult = sessionStorage.getItem('analyzeResult');
            if (storedResult) {
                try {
                    const parsedResult = JSON.parse(storedResult);
                    setResult(parsedResult);
                    // Clear sessionStorage after loading
                    sessionStorage.removeItem('analyzeResult');
                } catch (err) {
                    console.error('Failed to parse stored result:', err);
                }
            }
        }
    }, []);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const analysisResult = await analyzeUrl(url);
            setResult(analysisResult);
        } catch (err: any) {
            console.error('Analysis failed:', err);
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                err.message ||
                'Failed to analyze article. Please check the URL and try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-3xl font-bold mb-6 text-center text-slate-800 dark:text-slate-100">
                Article Analysis & Fact Check
            </h1>

            {/* Input Section */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-8">
                <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-4">
                    <input
                        type="url"
                        placeholder="Enter article URL (e.g., https://example.com/article)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing...
                            </>
                        ) : (
                            'Check Article'
                        )}
                    </button>
                </form>
                {error && (
                    <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
                        {error}
                    </div>
                )}
            </div>

            {/* Results Section */}
            {result && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Article Text */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100 border-b pb-2">
                            Source Article
                        </h2>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                {result.title}
                            </h3>
                            {result.byline && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    By {result.byline}
                                </p>
                            )}
                        </div>
                        <div className="prose dark:prose-invert max-w-none max-h-[600px] overflow-y-auto pr-2 custom-scrollbar text-sm leading-relaxed">
                            <p className="whitespace-pre-wrap">{result.content}</p>
                        </div>
                    </div>

                    {/* Right Column: Analysis */}
                    <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="bg-blue-50 dark:bg-slate-700/50 rounded-lg p-6 border border-blue-100 dark:border-slate-600">
                            <h2 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100 flex items-center">
                                <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full p-1 mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                Analysis Summary
                            </h2>
                            <p className="text-slate-700 dark:text-slate-300 mb-4">
                                {result.analysis.summary}
                            </p>

                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">Potential Bias:</span>
                                    <div className="flex items-center">
                                        <div className="w-32 h-3 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden mr-2">
                                            <div
                                                className={`h-full ${result.analysis.biasScore > 7 ? 'bg-red-500' :
                                                        result.analysis.biasScore > 4 ? 'bg-yellow-500' : 'bg-green-500'
                                                    }`}
                                                style={{ width: `${result.analysis.biasScore * 10}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                            {result.analysis.biasScore}/10
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                                    {result.analysis.biasAnalysis}
                                </p>
                            </div>
                        </div>

                        {/* Claims & Counter-Arguments */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-100">
                                Steelman Counter-Arguments ({result.analysis.claims.length})
                            </h3>

                            <div className="space-y-4">
                                {result.analysis.claims.map((claim, index) => (
                                    <div key={index} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-5 border-l-4 border-indigo-500">
                                        <div className="mb-3">
                                            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-1">
                                                Claim From Article
                                            </p>
                                            <blockquote className="italic text-slate-600 dark:text-slate-400 border-l-2 border-slate-300 dark:border-slate-600 pl-3 py-1 my-2 bg-slate-50 dark:bg-slate-900/50 rounded-r text-sm">
                                                "{claim.quote}"
                                            </blockquote>
                                        </div>

                                        <div className="mt-4">
                                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">
                                                Steelman Counter-Argument
                                            </p>
                                            <p className="text-slate-800 dark:text-slate-200 font-medium mb-2">
                                                {claim.counterArgument}
                                            </p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {claim.reasoning}
                                            </p>

                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                                                <span className="text-xs text-slate-500">Strength: {claim.strength}/10</span>
                                                {claim.source && (
                                                    <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
                                                        Source: {claim.source}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
