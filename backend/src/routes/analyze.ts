
import { Router, Request, Response } from 'express';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import * as https from 'https';
import * as http from 'http';
import { Readability } from '@mozilla/readability';
import { analyzeArticle } from '../services/aiService';
import { detectPlatform, extractSocialMediaContent } from '../utils/socialMediaExtractor';

const router = Router();

// Validation regex for URL
const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;

/**
 * POST /api/analyze
 * Body: { url: string }
 * 
 * Supports both regular articles and social media posts (Instagram, TikTok, Twitter, Facebook)
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const { url } = req.body;

        if (!url || !urlRegex.test(url)) {
            return res.status(400).json({ error: 'Invalid URL provided' });
        }

        const platform = detectPlatform(url);
        const isSocialMedia = platform !== 'unknown';

        if (process.env.NODE_ENV === 'development') {
            console.log(`[Analyze] Analyzing ${isSocialMedia ? platform : 'article'}: ${url}`);
        }

        let title: string;
        let content: string;
        let byline: string | undefined;
        let excerpt: string | undefined;
        let platformInfo: { platform: string; author?: string } | undefined;

        // Handle social media posts
        if (isSocialMedia) {
            try {
                const socialContent = await extractSocialMediaContent(url);

                // Additional validation: ensure content has meaningful text
                const textContent = socialContent.content.trim();
                if (!textContent || textContent.length < 10) {
                    return res.status(422).json({
                        error: `Cannot analyze ${platform} post`,
                        details: 'This post does not contain sufficient text content for analysis.',
                        suggestion: 'Only posts with captions, descriptions, or text content can be analyzed. Image-only or video-only posts without text cannot be processed.',
                    });
                }

                title = socialContent.title;
                content = textContent;
                byline = socialContent.author;
                excerpt = content.substring(0, 200) + (content.length > 200 ? '...' : '');
                platformInfo = {
                    platform: socialContent.platform,
                    author: socialContent.author,
                };

                if (process.env.NODE_ENV === 'development') {
                    console.log(`[Analyze] Extracted ${platform} content:`, {
                        title,
                        contentLength: content.length,
                        author: byline,
                    });
                }
            } catch (socialError: unknown) {
                const errorMessage = socialError instanceof Error ? socialError.message : 'Unknown error';
                console.error(`[Analyze] Failed to extract ${platform} content:`, errorMessage);

                // Check if error is about insufficient text content
                if (errorMessage.includes('sufficient text') || errorMessage.includes('does not contain')) {
                    return res.status(422).json({
                        error: `Cannot analyze ${platform} post`,
                        details: errorMessage,
                        suggestion: 'Only posts with captions, descriptions, or text content can be analyzed. Image-only or video-only posts without text cannot be processed.',
                    });
                }

                // Return helpful error message for other errors
                return res.status(422).json({
                    error: `Failed to extract ${platform} content`,
                    details: errorMessage,
                    suggestion: 'Make sure the post is public, contains text content, and the URL is correct.',
                });
            }
        } else {
            // Handle regular articles using Readability
            try {
                // User-Agent rotation strategy
                const userAgents = [
                    // Desktop Chrome (High value user)
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    // Googlebot (Often whitelisted)
                    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                    // Bingbot
                    'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
                ];

                let response;
                let htmlContent = '';
                let fetchError;

                // Create agents that force IPv4 to avoid ENOTFOUND issues on some networks
                const httpsAgent = new https.Agent({ family: 4, rejectUnauthorized: false });
                const httpAgent = new http.Agent({ family: 4 });

                // Try fetching with different User-Agents
                for (const ua of userAgents) {
                    try {
                        response = await axios.get(url, {
                            headers: {
                                'User-Agent': ua,
                                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                                'Accept-Language': 'en-US,en;q=0.9',
                                'Accept-Encoding': 'gzip, deflate, br',
                                'DNT': '1',
                                'Connection': 'keep-alive',
                                'Upgrade-Insecure-Requests': '1',
                                'Sec-Fetch-Dest': 'document',
                                'Sec-Fetch-Mode': 'navigate',
                                'Sec-Fetch-Site': 'none',
                                'Cache-Control': 'max-age=0',
                                'Referer': 'https://www.google.com/',
                            },
                            timeout: 15000,
                            maxRedirects: 5,
                            validateStatus: (status) => status < 500,
                            httpsAgent,
                            httpAgent,
                        });

                        if (response.status === 200 && typeof response.data === 'string' && response.data.length > 500) {
                            htmlContent = response.data;
                            break;
                        }
                    } catch (err: any) {
                        fetchError = err;
                        console.warn(`[Analyze] Failed fetch with UA "${ua.substring(0, 20)}...": ${err.message}`);
                        // Continue to next UA
                    }
                }

                if (!htmlContent) {
                    throw fetchError || new Error('Failed to fetch content with all User-Agents');
                }

                // Check for common paywall indicators
                const lowerContent = htmlContent.toLowerCase();

                // Check domain-specific paywall patterns FIRST (most reliable)
                const domain = new URL(url).hostname.toLowerCase();
                const paywalledDomains = [
                    'wsj.com',
                    'nytimes.com',
                    'washingtonpost.com',
                    'ft.com',
                    'economist.com',
                    'bloomberg.com',
                    'reuters.com', // Sometimes paywalled
                ];

                const isPaywalledDomain = paywalledDomains.some(paywallDomain =>
                    domain.includes(paywallDomain)
                );

                // Check for paywall indicators in content
                const paywallIndicators = [
                    'subscribe to continue reading',
                    'sign in to continue reading',
                    'this article is for subscribers only',
                    'paywall',
                    'subscription required',
                    'unlock this article',
                    'premium content',
                    'member exclusive',
                    'log in to read',
                    'create an account',
                    'free article limit',
                    'you\'ve reached your article limit',
                    'continue reading',
                ];

                const hasPaywallText = paywallIndicators.some(indicator =>
                    lowerContent.includes(indicator)
                );

                // Parse HTML once
                const dom = new JSDOM(htmlContent, { url });
                const document = dom.window.document;

                // Also check for common paywall class/ID patterns in HTML
                const paywallSelectors = [
                    '[class*="paywall"]',
                    '[class*="subscription"]',
                    '[id*="paywall"]',
                    '[id*="subscription"]',
                    '[data-paywall]',
                    '.paywall',
                    '#paywall',
                ];

                const hasPaywallElement = paywallSelectors.some(selector => {
                    try {
                        return document.querySelector(selector) !== null;
                    } catch {
                        return false;
                    }
                });

                // If it's a known paywalled domain, treat it as paywalled immediately
                const detectedPaywall = isPaywalledDomain || hasPaywallText || hasPaywallElement;

                // For known paywalled domains, return error immediately
                if (isPaywalledDomain) {
                    return res.status(422).json({
                        error: 'Article is behind a paywall',
                        details: `Articles from ${domain} require a subscription to access. We cannot extract content from paywalled articles.`,
                        suggestion: 'Please copy and paste the article text directly as a claim (use the "Claim" mode instead of "URL" mode), or try a publicly accessible article from a different source.',
                    });
                }

                // 3. Extract content with Readability
                const reader = new Readability(document);
                const article = reader.parse();

                if (!article) {
                    // Try to extract title from meta tags as fallback
                    const titleMeta = document.querySelector('meta[property="og:title"]') ||
                        document.querySelector('title');
                    const extractedTitle = titleMeta?.getAttribute('content') || titleMeta?.textContent || '';

                    if (detectedPaywall) {
                        return res.status(422).json({
                            error: 'Article is behind a paywall',
                            details: 'This article requires a subscription to access. We cannot extract content from paywalled articles like WSJ, NYTimes, or other subscription-based publications.',
                            suggestion: 'Please copy and paste the article text directly as a claim (use the "Claim" mode instead of "URL" mode), or try a publicly accessible article.',
                        });
                    }

                    return res.status(422).json({
                        error: 'Failed to extract article content',
                        details: extractedTitle ? `Found title: "${extractedTitle}" but could not extract article body.` : 'Could not parse article structure.',
                        suggestion: 'The URL might not be a valid article, the content structure is not supported, or the article may be behind a paywall. Try copying the article text and submitting it as a claim instead.',
                    });
                }

                // Check if extracted content is too short (might be paywall)
                const extractedContent = article.textContent || '';
                const contentLength = extractedContent.trim().length;

                // If content is very short and we detected paywall indicators, it's likely paywalled
                if (contentLength < 100 && detectedPaywall) {
                    return res.status(422).json({
                        error: 'Article is behind a paywall',
                        details: `Only ${contentLength} characters were extracted. This article likely requires a subscription to access the full content.`,
                        suggestion: 'Please copy and paste the article text directly as a claim (use the "Claim" mode instead of "URL" mode), or try a publicly accessible article.',
                    });
                }

                // If content is suspiciously short even without explicit paywall detection
                if (contentLength < 50) {
                    return res.status(422).json({
                        error: 'Insufficient article content extracted',
                        details: `Only ${contentLength} characters were extracted. The article may be behind a paywall or have restricted access.`,
                        suggestion: 'Please copy and paste the article text directly as a claim (use the "Claim" mode instead of "URL" mode), or try a publicly accessible article.',
                    });
                }

                title = article.title || 'Untitled Article';
                content = extractedContent;
                byline = article.byline || undefined;
                excerpt = article.excerpt || undefined;

                // Additional validation: ensure we got meaningful content
                if (!content || content.trim().length < 50) {
                    return res.status(422).json({
                        error: 'Insufficient article content extracted',
                        details: detectedPaywall
                            ? 'This article appears to be behind a paywall.'
                            : 'Could not extract enough content from the article.',
                        suggestion: detectedPaywall
                            ? 'Please try a publicly accessible article, or copy and paste the article text directly as a claim instead.'
                            : 'Please check the URL and ensure the article is publicly accessible.',
                    });
                }
            } catch (articleError: unknown) {
                const errorMessage = articleError instanceof Error ? articleError.message : 'Unknown error';
                console.error('[Analyze] Failed to extract article content:', errorMessage);

                // Check for specific error types
                let suggestion = 'Please check the URL and ensure the article is accessible.';
                if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
                    suggestion = 'This article may be behind a paywall or require authentication. Try copying the article text and submitting it as a claim instead.';
                } else if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
                    suggestion = 'The article URL may be invalid or the page may have been removed.';
                } else if (errorMessage.includes('timeout')) {
                    suggestion = 'The request timed out. The website may be slow or blocking automated requests.';
                }

                return res.status(422).json({
                    error: 'Failed to extract article content',
                    details: errorMessage,
                    suggestion: suggestion,
                });
            }
        }

        // Analyze content with AI (works for both articles and social media posts)
        const analysis = await analyzeArticle({
            title: title,
            content: content,
            url: url,
        });

        // Return result
        return res.json({
            title,
            byline,
            excerpt,
            content, // Full text for display
            platform: platformInfo?.platform,
            author: platformInfo?.author,
            analysis: analysis,
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Analyze] Analysis error:', errorMessage);
        if (process.env.NODE_ENV === 'development' && error instanceof Error) {
            console.error('[Analyze] Stack:', error.stack);
        }
        return res.status(500).json({
            error: 'Failed to analyze content',
            details: errorMessage,
        });
    }
});

export default router;
