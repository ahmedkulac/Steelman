
import { Router, Request, Response } from 'express';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { analyzeArticle } from '../services/aiService';

const router = Router();

// Validation regex for URL
const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;

/**
 * POST /api/analyze
 * Body: { url: string }
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const { url } = req.body;

        if (!url || !urlRegex.test(url)) {
            return res.status(400).json({ error: 'Invalid URL provided' });
        }

        console.log(`Analyzing article: ${url}`);

        // 1. Fetch HTML
        const response = await axios.get(url, {
            headers: {
                // Mimic a browser to avoid some bot detection
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (HTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
            timeout: 10000, // 10s timeout
        });

        // 2. Parse HTML with JSDOM
        const dom = new JSDOM(response.data, {
            url: url,
        });

        // 3. Extract content with Readability
        const reader = new Readability(dom.window.document);
        const article = reader.parse();

        if (!article) {
            return res.status(422).json({ error: 'Failed to extract article content' });
        }

        // 4. Analyze with AI
        const analysis = await analyzeArticle({
            title: article.title || 'Untitled Article',
<<<<<<< Updated upstream
            content: article.textContent || '', // distinct from .content (HTML)
=======
            content: article.textContent || '',
>>>>>>> Stashed changes
            url: url,
        });

        // 5. Return result
        return res.json({
            title: article.title,
            byline: article.byline,
            excerpt: article.excerpt,
            content: article.textContent, // Full text for display
            analysis: analysis,
        });
    } catch (error: any) {
        console.error('Analysis error:', error.message);
        return res.status(500).json({
            error: 'Failed to analyze article',
            details: error.message,
        });
    }
});

export default router;
