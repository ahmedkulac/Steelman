/**
 * Source Search Utility
 * 
 * Searches the web for sources to support claims and counter-arguments.
 * Uses DuckDuckGo HTML search (free, no API key required) as a fallback,
 * with support for other search APIs via environment variables.
 */

import axios from 'axios';
import { JSDOM } from 'jsdom';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  relevanceScore?: number;
}

/**
 * Search for sources using DuckDuckGo HTML search
 * This is a free alternative that doesn't require an API key
 * 
 * @param query - Search query
 * @param maxResults - Maximum number of results to return (default: 5)
 * @returns Array of search results
 */
export async function searchSources(
  query: string,
  maxResults: number = 5
): Promise<SearchResult[]> {
  try {
    // Use DuckDuckGo HTML search (free, no API key)
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000,
    });

    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    const results: SearchResult[] = [];
    
    // DuckDuckGo HTML structure: try multiple selectors for robustness
    // Modern DuckDuckGo uses .result, older versions might use different classes
    let resultElements = document.querySelectorAll('.result');
    
    // Fallback: try other common result container selectors
    if (resultElements.length === 0) {
      resultElements = document.querySelectorAll('.web-result');
    }
    if (resultElements.length === 0) {
      resultElements = document.querySelectorAll('[class*="result"]');
    }
    
    for (let i = 0; i < Math.min(resultElements.length, maxResults); i++) {
      const result = resultElements[i];
      
      // Try multiple selectors for title/link
      const titleElement = result.querySelector('.result__a') || 
                          result.querySelector('.result-title a') ||
                          result.querySelector('a.result__a') ||
                          result.querySelector('h2 a') ||
                          result.querySelector('a[href^="http"]');
      
      const title = titleElement?.textContent?.trim() || 'Untitled';
      
      // Extract URL - try href attribute first, then check for data attributes
      let url = titleElement?.getAttribute('href') || '';
      
      // DuckDuckGo sometimes uses relative URLs that need to be resolved
      if (url && !url.startsWith('http')) {
        // Try to resolve relative URLs
        if (url.startsWith('/l/?kh=')) {
          // DuckDuckGo redirect URLs - extract the actual URL
          const urlMatch = url.match(/uddg=([^&]+)/);
          if (urlMatch) {
            url = decodeURIComponent(urlMatch[1]);
          }
        } else if (url.startsWith('/')) {
          // Relative URL - prepend domain
          url = `https://duckduckgo.com${url}`;
        }
      }
      
      // Extract snippet - try multiple selectors
      const snippetElement = result.querySelector('.result__snippet') || 
                            result.querySelector('.result-snippet') ||
                            result.querySelector('.result__body') ||
                            result.querySelector('.snippet');
      const snippet = snippetElement?.textContent?.trim() || '';

      // Only add if we have a valid URL and title
      if (url && title && url.startsWith('http')) {
        results.push({
          title: title.substring(0, 200), // Limit title length
          url,
          snippet: snippet.substring(0, 300), // Limit snippet length
        });
      }
    }

    return results;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Search Sources] Error searching:', errorMessage);
    
    // Return empty array on error (don't fail the whole request)
    return [];
  }
}

/**
 * Search for sources supporting a claim
 * 
 * @param claim - The claim to find sources for
 * @returns Array of search results
 */
export async function searchClaimSources(claim: string): Promise<SearchResult[]> {
  // Create search query from claim
  const query = `${claim} evidence sources`;
  return searchSources(query, 5);
}

/**
 * Search for sources supporting a counter-argument
 * 
 * @param counterArgument - The counter-argument text
 * @param claim - The original claim (for context)
 * @returns Array of search results
 */
export async function searchCounterArgumentSources(
  counterArgument: string,
  claim?: string
): Promise<SearchResult[]> {
  // Create search query from counter-argument
  let query = counterArgument;
  if (claim) {
    // Add claim context to improve search relevance
    query = `${counterArgument} evidence against "${claim}"`;
  }
  return searchSources(query, 5);
}

/**
 * Search for multiple queries and combine results
 * 
 * @param queries - Array of search queries
 * @param maxResultsPerQuery - Max results per query
 * @returns Combined array of unique search results
 */
export async function searchMultipleQueries(
  queries: string[],
  maxResultsPerQuery: number = 3
): Promise<SearchResult[]> {
  const allResults: SearchResult[] = [];
  const seenUrls = new Set<string>();

  // Search each query
  for (const query of queries) {
    try {
      const results = await searchSources(query, maxResultsPerQuery);
      
      // Add unique results
      for (const result of results) {
        if (!seenUrls.has(result.url)) {
          seenUrls.add(result.url);
          allResults.push(result);
        }
      }
    } catch (error) {
      // Continue with other queries if one fails
      console.error(`[Search Sources] Error searching query "${query}":`, error);
    }
  }

  return allResults;
}
