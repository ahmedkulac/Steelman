'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { analyzeUrl, AnalysisResult, AnalyzedClaim, FactCheck } from '@/lib/api/analyze';
import Link from 'next/link';
import CopyButton from '@/components/CopyButton';
import SourcesList from '@/components/SourcesList';

// Unified highlight interface
interface HighlightItem {
    type: 'claim' | 'fact';
    index: number; // Index in the original array (claims or factChecks)
    quote: string;
    startChar: number; // For sorting
}

export default function AnalyzePage() {
    return (
        <React.Suspense fallback={<div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">Loading...</div>}>
            <AnalyzeContent />
        </React.Suspense>
    );
}

function AnalyzeContent() {
    const searchParams = useSearchParams();
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<AnalysisResult | null>(null);

    // Highlight State
    const [activeHighlight, setActiveHighlight] = useState<HighlightItem | null>(null);
    const [highlights, setHighlights] = useState<HighlightItem[]>([]);

    // Refs
    // We store refs to claim cards and fact check cards
    // The key will be `${type}-${index}`
    const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const articleTextRef = useRef<HTMLDivElement>(null);

    // Check for result from sessionStorage (redirected from ClaimInput)
    useEffect(() => {
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

    const performAnalysis = async (targetUrl: string) => {
        setLoading(true);
        setError(null);
        setResult(null);
        setActiveHighlight(null);
        setHighlights([]);

        try {
            const analysisResult = await analyzeUrl(targetUrl);
            setResult(analysisResult);
        } catch (err: any) {
            console.error('Analysis failed:', err);
            const errorData = err.response?.data;
            let errorMessage = errorData?.error ||
                errorData?.details ||
                errorData?.message ||
                err.message ||
                'Failed to analyze content. Please check the URL and try again.';

            if (errorData?.suggestion) {
                errorMessage += ` ${errorData.suggestion}`;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Check for URL param on mount
    useEffect(() => {
        const urlParam = searchParams.get('url');
        if (urlParam && !result && !loading) {
            setUrl(urlParam);
            performAnalysis(urlParam);
        }
    }, [searchParams]);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;
        await performAnalysis(url);
    };

    // Calculate highlights when result changes
    useEffect(() => {
        if (result) {
            const newHighlights: HighlightItem[] = [];

            // Add claims (Type: 'claim')
            result.analysis.claims.forEach((claim, index) => {
                if (!claim.quote) return;
                // Find all occurrences or just the first? 
                // AI usually quotes unique strings. We'll find the first one for now.
                const quoteIndex = result.content.indexOf(claim.quote);
                if (quoteIndex !== -1) {
                    newHighlights.push({
                        type: 'claim',
                        index: index,
                        quote: claim.quote,
                        startChar: quoteIndex
                    });
                }
            });

            // Add fact checks (Type: 'fact')
            if (result.analysis.factChecks) {
                result.analysis.factChecks.forEach((check, index) => {
                    if (!check.quote) return;
                    const quoteIndex = result.content.indexOf(check.quote);
                    if (quoteIndex !== -1) {
                        newHighlights.push({
                            type: 'fact',
                            index: index,
                            quote: check.quote,
                            startChar: quoteIndex
                        });
                    }
                });
            }

            // Sort by position
            newHighlights.sort((a, b) => a.startChar - b.startChar);
            setHighlights(newHighlights);
        }
    }, [result]);

    const scrollToHighlight = (highlight: HighlightItem) => {
        setActiveHighlight(highlight);

        // Find the card ref
        const key = `${highlight.type}-${highlight.index}`;
        const cardEl = cardRefs.current.get(key);

        if (cardEl) {
            cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Add momentary flash effect
            cardEl.classList.add('ring-4', highlight.type === 'claim' ? 'ring-yellow-400' : 'ring-green-400');
            setTimeout(() => {
                cardEl.classList.remove('ring-4', 'ring-yellow-400', 'ring-green-400');
            }, 1500);
        }

        // Also scroll the text highlight into view if needed
        const highlightId = `highlight-${highlight.type}-${highlight.index}`;
        const highlightEl = document.getElementById(highlightId);
        if (highlightEl) {
            highlightEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const navigateHighlight = (direction: 'next' | 'prev') => {
        if (highlights.length === 0) return;

        let nextIndex = 0;
        if (activeHighlight) {
            // Find current index in the SORTED highlights array
            const currentSortedIndex = highlights.findIndex(
                h => h.type === activeHighlight.type && h.index === activeHighlight.index
            );

            if (currentSortedIndex !== -1) {
                if (direction === 'next') {
                    nextIndex = currentSortedIndex + 1;
                    if (nextIndex >= highlights.length) nextIndex = 0; // Loop to start
                } else {
                    nextIndex = currentSortedIndex - 1;
                    if (nextIndex < 0) nextIndex = highlights.length - 1; // Loop to end
                }
            }
        }

        scrollToHighlight(highlights[nextIndex]);
    };

<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    const [showTextFallback, setShowTextFallback] = useState(false);
    const [textInput, setTextInput] = useState('');

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url && !textInput) return;

        setLoading(true);
        setError(null);
        setResult(null);
        setActiveHighlight(null);
        setHighlights([]);

        try {
            // If using text fallback, pass both URL (for reference) and text
            const analysisResult = await analyzeUrl(url, showTextFallback ? textInput : undefined);
            setResult(analysisResult);
            setShowTextFallback(false); // Reset fallback state on success
        } catch (err: any) {
            console.error('Analysis failed:', err);
            const errorData = err.response?.data;
            let errorMessage = errorData?.error ||
                errorData?.details ||
                errorData?.message ||
                err.message ||
                'Failed to analyze content. Please check the URL and try again.';

            if (errorData?.suggestion) {
                errorMessage += ` ${errorData.suggestion}`;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    /**
     * Renders text with highlights
     */
    const renderHighlightedContent = () => {
        if (!result) return null;

        let content = result.content;
        const paragraphs = content.split('\n').filter(line => line.trim().length > 0);

        return (
            <div ref={articleTextRef} className="prose dark:prose-invert max-w-none text-base leading-relaxed text-slate-800 dark:text-slate-300 relative">
                {/* Navigation Floating Controls */}
                {highlights.length > 0 && (
                    <div className="sticky top-4 z-10 flex justify-end mb-2 pointer-events-none">
                        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-lg rounded-full px-4 py-2 border border-slate-200 dark:border-slate-700 flex items-center gap-3 pointer-events-auto transition-all transform hover:scale-105">
                            <button
                                onClick={() => navigateHighlight('prev')}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-300"
                                title="Previous Highlight"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                                {activeHighlight
                                    ? `${highlights.findIndex(h => h.type === activeHighlight.type && h.index === activeHighlight.index) + 1} / ${highlights.length}`
                                    : `${highlights.length} highlights`
                                }
                            </span>
                            <button
                                onClick={() => navigateHighlight('next')}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-300"
                                title="Next Highlight"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>
                )}

                {paragraphs.map((paragraph, pIndex) => {
                    // Find highlights that exist in this paragraph
                    const paragraphHighlights = highlights.filter(h => paragraph.includes(h.quote));

                    if (paragraphHighlights.length === 0) {
                        return (
                            <p key={pIndex} className="mb-4">
                                {paragraph}
                            </p>
                        );
                    }

                    // Sort highlights by their position in THIS paragraph
                    const sortedLocalHighlights = [...paragraphHighlights].sort((a, b) => {
                        return paragraph.indexOf(a.quote) - paragraph.indexOf(b.quote);
                    });

                    // Build the paragraph content
                    const pContent: React.ReactNode[] = [];
                    let cursor = 0;

                    // Iterate through sorted highlights and slice the paragraph
                    sortedLocalHighlights.forEach((h, hIdx) => {
                        // Find the quote starting from current cursor to avoid backtracking
                        const start = paragraph.indexOf(h.quote, cursor);

                        // Only process if found and not overlapping with previous
                        if (start !== -1 && start >= cursor) {
                            // Text before the highlight
                            if (start > cursor) {
                                pContent.push(<span key={`text-${hIdx}`}>{paragraph.substring(cursor, start)}</span>);
                            }

                            // The highlight itself
                            const isActive = activeHighlight?.type === h.type && activeHighlight?.index === h.index;

                            let bgClass = '';
                            if (h.type === 'claim') {
                                bgClass = isActive
                                    ? 'bg-yellow-300 dark:bg-yellow-600 text-black font-medium ring-2 ring-yellow-500/50 shadow-md transform scale-[1.02]'
                                    : 'bg-yellow-100 dark:bg-yellow-900/40 hover:bg-yellow-200 dark:hover:bg-yellow-800 text-slate-900 dark:text-slate-100 shadow-sm hover:shadow active:scale-95 border-b-2 border-yellow-300 dark:border-yellow-700';
                            } else {
                                // Green for Fact Checks
                                bgClass = isActive
                                    ? 'bg-green-300 dark:bg-green-600 text-black font-medium ring-2 ring-green-500/50 shadow-md transform scale-[1.02]'
                                    : 'bg-green-100 dark:bg-green-900/40 hover:bg-green-200 dark:hover:bg-green-800 text-slate-900 dark:text-slate-100 shadow-sm hover:shadow active:scale-95 border-b-2 border-green-300 dark:border-green-700';
                            }

                            pContent.push(
                                <span
                                    key={`highlight-${h.type}-${h.index}-${hIdx}`}
                                    id={`highlight-${h.type}-${h.index}`}
                                    className={`cursor-pointer transition-all duration-200 px-1.5 py-0.5 rounded mx-0.5 inline-block ${bgClass}`}
                                    onClick={() => scrollToHighlight(h)}
                                    title={h.type === 'claim' ? "View Counter-Argument" : "View Fact Check"}
                                >
                                    {h.quote}
                                </span>
                            );

                            cursor = start + h.quote.length;
                        }
                    });

                    // Remaining text after last highlight
                    if (cursor < paragraph.length) {
                        pContent.push(<span key="text-end">{paragraph.substring(cursor)}</span>);
                    }

                    return (
                        <p key={pIndex} className="mb-4">
                            {pContent}
                        </p>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <h1 className="text-3xl font-bold mb-6 text-center text-slate-800 dark:text-slate-100">
                    Article Analysis & Fact Check
                </h1>

                {/* Input Section */}
                {!result && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-8">
                        <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-4">
                            <input
                                type="url"
                                placeholder="Enter article URL (e.g., https://example.com/article)"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                                required
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-gray-900 hover:bg-yellow-400 text-white hover:text-black dark:bg-gray-100 dark:hover:bg-yellow-400 dark:text-black font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                                <div className="font-semibold mb-2">{error.includes('paywall') ? '⚠️ Paywall Detected' : 'Error'}</div>
                                <div className="text-sm">{error}</div>

                                {/* Text Fallback Button */}
                                {!showTextFallback && (
                                    <button
                                        type="button"
                                        onClick={() => setShowTextFallback(true)}
                                        className="mt-3 text-sm font-medium underline hover:text-red-900 dark:hover:text-red-100 transition-colors"
                                    >
                                        Having trouble? Paste article text manually
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Text Fallback Input */}
                        {showTextFallback && (
                            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 animate-fade-in">
                                <h3 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                                    Manual Text Entry
                                </h3>
                                <textarea
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm min-h-[150px] mb-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                                    placeholder="Paste the full article text here..."
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowTextFallback(false)}
                                        className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleAnalyze}
                                        disabled={!textInput || loading}
                                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                                    >
                                        Analyze Text
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Results Section */}
                {result && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <Link
                                href="/"
                                className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                            >
                                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Home
                            </Link>

                            <button
                                onClick={() => {
                                    setResult(null);
                                    setActiveHighlight(null);
                                    setHighlights([]);
                                }}
                                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:underline flex items-center gap-2 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Analyze Another Article
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column: Article Text */}
                            <div className="bg-transparent dark:bg-transparent pl-0 pt-0">

                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-2">
                                        {result.title}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                                        {(result.byline || result.author) && (
                                            <span>By {result.author || result.byline}</span>
                                        )}
                                        {result.platform && (
                                            <>
                                                <span>•</span>
                                                <span className="uppercase tracking-wider text-xs font-semibold">
                                                    {result.platform}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {renderHighlightedContent()}
                            </div>

                            {/* Right Column: Analysis */}
                            <div className="space-y-6">
                                {/* Summary Card */}
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
                                    <h2 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100 flex items-center">
                                        <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full p-1 mr-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                        Analysis Summary
                                    </h2>
                                    <p className="text-slate-700 dark:text-slate-300 mb-4">
                                        {result.analysis.summary}
                                    </p>
                                </div>

                                {/* Fact Checks Section */}
                                {result.analysis.factChecks && result.analysis.factChecks.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-100 flex items-center">
                                            <span className="mr-2 text-yellow-500">🔍</span>
                                            Fact Checks
                                        </h3>
                                        <div className="space-y-4">
                                            {result.analysis.factChecks.map((check, index) => {
                                                const isActive = activeHighlight?.type === 'fact' && activeHighlight.index === index;
                                                return (
                                                    <div
                                                        key={index}
                                                        ref={(el) => { if (el) cardRefs.current.set(`fact-${index}`, el); }}
                                                        className={`rounded-lg p-4 border transition-all duration-300 ${isActive
                                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-400 ring-2 ring-green-400/50'
                                                            : 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800'
                                                            }`}
                                                    >
                                                        <p className="text-xs font-bold uppercase tracking-wide mb-1 text-slate-500 dark:text-slate-400">
                                                            Checking: "{check.statement}"
                                                        </p>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${check.verdict === 'verified' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                                check.verdict === 'disputed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                                    check.verdict === 'misleading' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                                                                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                                                }`}>
                                                                {check.verdict.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-700 dark:text-slate-300">
                                                            {check.reasoning}
                                                        </p>

                                                        {check.sources && check.sources.length > 0 && (
                                                            <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                                                                <SourcesList sources={check.sources} title="Verification Sources" />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Claims & Counter-Arguments */}
                                <div>
                                    <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-100">
                                        Steelman Counter-Arguments ({result.analysis.claims.length})
                                    </h3>

                                    <div className="space-y-4">
                                        {result.analysis.claims.map((claim, index) => {
                                            const isActive = activeHighlight?.type === 'claim' && activeHighlight.index === index;
                                            return (
                                                <div
                                                    key={index}
                                                    ref={(el) => { if (el) cardRefs.current.set(`claim-${index}`, el); }}
                                                    className={`rounded-lg shadow-md p-5 border-l-4 transition-all duration-300 ${isActive
                                                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-yellow-600 ring-2 ring-yellow-400/50'
                                                        : 'bg-white dark:bg-gray-900 border-l-yellow-400 dark:border-l-yellow-400 border-y border-r border-gray-200 dark:border-gray-800'
                                                        }`}
                                                >
                                                    <div className="mb-3">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                                                Claim From Article
                                                            </p>
                                                            <CopyButton text={claim.quote} size="sm" />
                                                        </div>
                                                        <blockquote className="italic text-slate-600 dark:text-slate-400 border-l-2 border-slate-300 dark:border-slate-600 pl-3 py-1 my-2 bg-slate-50 dark:bg-slate-900/50 rounded-r text-sm">
                                                            "{claim.quote}"
                                                        </blockquote>
                                                    </div>

                                                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center text-xs font-bold">
                                                                    {index + 1}
                                                                </span>
                                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                                                    Counter-Argument
                                                                </p>
                                                            </div>
                                                            <CopyButton text={claim.counterArgument} size="sm" />
                                                        </div>
                                                        <p className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed mb-3">
                                                            {claim.counterArgument}
                                                        </p>
                                                        {claim.reasoning && (
                                                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-3 border-l-2 border-yellow-300 dark:border-yellow-600">
                                                                {claim.reasoning}
                                                            </p>
                                                        )}

                                                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                                                            {claim.sources && claim.sources.length > 0 && (
                                                                <SourcesList sources={claim.sources} title="Sources" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
