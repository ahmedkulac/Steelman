/**
 * Social Media Content Extractor
 * 
 * Extracts content from various social media platforms including:
 * - Instagram
 * - TikTok
 * - Twitter/X
 * - Facebook
 * 
 * Uses platform-specific APIs (oEmbed) and fallback scraping methods.
 */

import axios from 'axios';
import { JSDOM } from 'jsdom';

export type SocialPlatform = 'instagram' | 'tiktok' | 'twitter' | 'facebook' | 'unknown';

export interface SocialMediaContent {
  platform: SocialPlatform;
  title: string;
  content: string;
  author?: string;
  authorUrl?: string;
  thumbnailUrl?: string;
  publishedAt?: string;
  url: string;
}

/**
 * Detect social media platform from URL
 */
export function detectPlatform(url: string): SocialPlatform {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('instagram.com') || lowerUrl.includes('instagr.am')) {
    return 'instagram';
  }
  if (lowerUrl.includes('tiktok.com')) {
    return 'tiktok';
  }
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
    return 'twitter';
  }
  if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com')) {
    return 'facebook';
  }
  
  return 'unknown';
}

/**
 * Extract Instagram post content
 */
async function extractInstagram(url: string): Promise<SocialMediaContent> {
  try {
    // Try Instagram oEmbed API first (requires access token, but works for public posts)
    // For now, we'll scrape the page
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (HTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 15000,
      maxRedirects: 5,
    });

    const dom = new JSDOM(response.data, { url });
    const document = dom.window.document;

    // Extract title from meta tags
    const titleMeta = document.querySelector('meta[property="og:title"]') || 
                     document.querySelector('meta[name="title"]') ||
                     document.querySelector('title');
    const title = titleMeta?.getAttribute('content') || titleMeta?.textContent || 'Instagram Post';

    // Extract description/caption
    const descriptionMeta = document.querySelector('meta[property="og:description"]') ||
                           document.querySelector('meta[name="description"]');
    const description = descriptionMeta?.getAttribute('content') || '';

    // Extract author/username
    // Try to get from URL first (instagram.com/username/p/...)
    let author = '';
    const urlMatch = url.match(/instagram\.com\/([^\/]+)/i);
    if (urlMatch && urlMatch[1] && urlMatch[1] !== 'p' && urlMatch[1] !== 'reel') {
      author = `@${urlMatch[1]}`;
    }
    
    // Also try meta tags
    const authorMeta = document.querySelector('meta[property="article:author"]') ||
                       document.querySelector('meta[name="author"]') ||
                       document.querySelector('meta[property="og:site_name"]');
    if (!author && authorMeta) {
      const authorContent = authorMeta.getAttribute('content') || '';
      // If it's just "Instagram", try to find username elsewhere
      if (authorContent.toLowerCase() !== 'instagram') {
        author = authorContent;
      }
    }
    
    // Try to extract from title (often format: "Username on Instagram: ...")
    if (!author && title) {
      const titleMatch = title.match(/([^@\s]+)\s+on\s+Instagram/i);
      if (titleMatch && titleMatch[1]) {
        author = `@${titleMatch[1]}`;
      }
    }

    // Extract image
    const imageMeta = document.querySelector('meta[property="og:image"]');
    const thumbnailUrl = imageMeta?.getAttribute('content') || undefined;

    // Try to extract caption from JSON-LD or script tags
    let caption = description;
    const scriptTags = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of Array.from(scriptTags)) {
      try {
        const json = JSON.parse(script.textContent || '{}');
        if (json.caption) {
          caption = json.caption;
          break;
        }
      } catch {
        // Ignore parse errors
      }
    }

    // If no caption found, try to find it in the page text
    if (!caption || caption.length < 10) {
      const article = document.querySelector('article');
      if (article) {
        const textContent = article.textContent || '';
        // Look for caption-like text (usually near the top)
        const lines = textContent.split('\n').filter(line => line.trim().length > 0);
        if (lines.length > 0) {
          caption = lines.slice(0, 3).join(' ').trim();
        }
      }
    }

    const content = caption || description || '';
    
    // Validate that we have meaningful text content
    if (!content || content.trim().length < 10) {
      throw new Error('Instagram post does not contain sufficient text content. Only posts with captions or text can be analyzed.');
    }

    return {
      platform: 'instagram',
      title: title,
      content: content,
      author: author,
      thumbnailUrl,
      url,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to extract Instagram content: ${errorMessage}`);
  }
}

/**
 * Extract TikTok post content
 */
async function extractTikTok(url: string): Promise<SocialMediaContent> {
  try {
    // Try TikTok oEmbed API
    try {
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
      const oembedResponse = await axios.get(oembedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 10000,
      });

      if (oembedResponse.data) {
        const data = oembedResponse.data;
        return {
          platform: 'tiktok',
          title: data.title || 'TikTok Video',
          content: data.title || data.author_name || 'TikTok video content',
          author: data.author_name,
          authorUrl: data.author_url,
          thumbnailUrl: data.thumbnail_url,
          url,
        };
      }
    } catch (oembedError) {
      // Fall back to scraping if oEmbed fails
      if (process.env.NODE_ENV === 'development') {
      }
    }

    // Fallback: Scrape the page
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (HTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 15000,
      maxRedirects: 5,
    });

    const dom = new JSDOM(response.data, { url });
    const document = dom.window.document;

    // Extract title
    const titleMeta = document.querySelector('meta[property="og:title"]') ||
                     document.querySelector('title');
    const title = titleMeta?.getAttribute('content') || titleMeta?.textContent || 'TikTok Video';

    // Extract description
    const descriptionMeta = document.querySelector('meta[property="og:description"]') ||
                           document.querySelector('meta[name="description"]');
    const description = descriptionMeta?.getAttribute('content') || '';

    // Extract author/username
    // Try to get from URL first (tiktok.com/@username/video/...)
    let author = '';
    const urlMatch = url.match(/tiktok\.com\/@([^\/]+)/i);
    if (urlMatch && urlMatch[1]) {
      author = `@${urlMatch[1]}`;
    }
    
    // Also try meta tags
    const authorMeta = document.querySelector('meta[name="author"]') ||
                       document.querySelector('meta[property="og:site_name"]');
    if (!author && authorMeta) {
      const authorContent = authorMeta.getAttribute('content') || '';
      if (authorContent.toLowerCase() !== 'tiktok') {
        author = authorContent;
      }
    }

    // Extract thumbnail
    const imageMeta = document.querySelector('meta[property="og:image"]');
    const thumbnailUrl = imageMeta?.getAttribute('content') || undefined;

    const content = description || title || '';
    
    // Validate that we have meaningful text content
    if (!content || content.trim().length < 10) {
      throw new Error('TikTok video does not contain sufficient text content. Only videos with descriptions or captions can be analyzed.');
    }

    return {
      platform: 'tiktok',
      title: title,
      content: content,
      author: author,
      thumbnailUrl,
      url,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to extract TikTok content: ${errorMessage}`);
  }
}

/**
 * Extract Twitter/X post content
 */
async function extractTwitter(url: string): Promise<SocialMediaContent> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (HTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 15000,
      maxRedirects: 5,
    });

    const dom = new JSDOM(response.data, { url });
    const document = dom.window.document;

    // Extract title (usually includes the tweet text)
    const titleMeta = document.querySelector('meta[property="og:title"]') ||
                     document.querySelector('meta[name="twitter:title"]') ||
                     document.querySelector('title');
    const title = titleMeta?.getAttribute('content') || titleMeta?.textContent || 'Twitter Post';

    // Extract description (tweet content)
    const descriptionMeta = document.querySelector('meta[property="og:description"]') ||
                           document.querySelector('meta[name="twitter:description"]') ||
                           document.querySelector('meta[name="description"]');
    const description = descriptionMeta?.getAttribute('content') || '';

    // Extract author
    const authorMeta = document.querySelector('meta[name="twitter:creator"]') ||
                      document.querySelector('meta[property="article:author"]');
    const author = authorMeta?.getAttribute('content') || '';

    // Extract image
    const imageMeta = document.querySelector('meta[property="og:image"]') ||
                     document.querySelector('meta[name="twitter:image"]');
    const thumbnailUrl = imageMeta?.getAttribute('content') || undefined;

    const content = description || title || '';
    
    // Validate that we have meaningful text content
    if (!content || content.trim().length < 10) {
      throw new Error('Twitter post does not contain sufficient text content. Only posts with text can be analyzed.');
    }

    return {
      platform: 'twitter',
      title: title,
      content: content,
      author: author,
      thumbnailUrl,
      url,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to extract Twitter content: ${errorMessage}`);
  }
}

/**
 * Extract Facebook post content
 */
async function extractFacebook(url: string): Promise<SocialMediaContent> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (HTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 15000,
      maxRedirects: 5,
    });

    const dom = new JSDOM(response.data, { url });
    const document = dom.window.document;

    const titleMeta = document.querySelector('meta[property="og:title"]') ||
                     document.querySelector('title');
    const title = titleMeta?.getAttribute('content') || titleMeta?.textContent || 'Facebook Post';

    const descriptionMeta = document.querySelector('meta[property="og:description"]') ||
                           document.querySelector('meta[name="description"]');
    const description = descriptionMeta?.getAttribute('content') || '';

    const authorMeta = document.querySelector('meta[property="article:author"]') ||
                      document.querySelector('meta[property="og:site_name"]');
    const author = authorMeta?.getAttribute('content') || '';

    const imageMeta = document.querySelector('meta[property="og:image"]');
    const thumbnailUrl = imageMeta?.getAttribute('content') || undefined;

    const content = description || title || '';
    
    // Validate that we have meaningful text content
    if (!content || content.trim().length < 10) {
      throw new Error('Facebook post does not contain sufficient text content. Only posts with text can be analyzed.');
    }

    return {
      platform: 'facebook',
      title: title,
      content: content,
      author: author,
      thumbnailUrl,
      url,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to extract Facebook content: ${errorMessage}`);
  }
}

/**
 * Extract content from a social media URL
 * 
 * Automatically detects the platform and uses appropriate extraction method
 */
export async function extractSocialMediaContent(url: string): Promise<SocialMediaContent> {
  const platform = detectPlatform(url);

  switch (platform) {
    case 'instagram':
      return await extractInstagram(url);
    case 'tiktok':
      return await extractTikTok(url);
    case 'twitter':
      return await extractTwitter(url);
    case 'facebook':
      return await extractFacebook(url);
    default:
      throw new Error(`Unsupported social media platform or not a social media URL: ${url}`);
  }
}
