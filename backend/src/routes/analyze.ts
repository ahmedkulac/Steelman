
import { Router, Request, Response } from 'express';
import axios from 'axios';
import { JSDOM } from 'jsdom';
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
                // 1. Fetch HTML
                const response = await axios.get(url, {
                    headers: {
                        // Mimic a browser to avoid some bot detection
                        'User-Agent':
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (HTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9',
                    },
                    timeout: 15000, // 15s timeout
                    maxRedirects: 5,
                });

                // 2. Parse HTML with JSDOM
                const dom = new JSDOM(response.data, {
                    url: url,
                });

                // 3. Extract content with Readability
                const reader = new Readability(dom.window.document);
                const article = reader.parse();

                if (!article) {
                    return res.status(422).json({
                        error: 'Failed to extract article content',
                        suggestion: 'The URL might not be a valid article, or the content structure is not supported.',
                    });
                }

                title = article.title || 'Untitled Article';
                content = article.textContent || '';
                byline = article.byline || undefined;
                excerpt = article.excerpt || undefined;
            } catch (articleError: unknown) {
                const errorMessage = articleError instanceof Error ? articleError.message : 'Unknown error';
                console.error('[Analyze] Failed to extract article content:', errorMessage);
                
                return res.status(422).json({
                    error: 'Failed to extract article content',
                    details: errorMessage,
                    suggestion: 'Please check the URL and ensure the article is accessible.',
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
