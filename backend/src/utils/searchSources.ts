
/**
 * Source Search Utility
 * 
 * Searches the web for sources using duck-duck-scrape integration.
 * Includes rate limit handling and error recovery.
 */

// @ts-ignore - duck-duck-scrape doesn't have type definitions
import { search, SafeSearchType } from 'duck-duck-scrape';
import axios from 'axios';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  relevanceScore?: number;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Search for sources using duck-duck-scrape
 */
export async function searchSources(
  query: string,
  maxResults: number = 5
): Promise<SearchResult[]> {
  try {
    // Add random delay to avoid rate limits
    await sleep(Math.random() * 1000 + 500);

    const searchOptions = {
      safeSearch: SafeSearchType.MODERATE
    };

    const results = await search(query, searchOptions);

    // Map library results to our format
    const mappedResults: SearchResult[] = results.results.map((r: any) => ({
      title: r.title,
      url: r.url,
      snippet: r.description || r.snippet || '',
    })).filter((r: SearchResult) => r.url && r.url.startsWith('http'));

    return mappedResults.slice(0, maxResults);

  } catch (error: any) {
    console.error('[Search Sources] Error searching:', error.message);

    // Fallback 1: Try Google News RSS
    try {
      // Use a browser-like User-Agent
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
      const response = await axios.get(rssUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      // Simple XML parsing with regex to avoid heavy deps
      const items = response.data.match(/<item>[\s\S]*?<\/item>/g) || [];

      const rssResults: SearchResult[] = [];
      for (const item of items.slice(0, maxResults)) {
        const titleMatch = item.match(/<title>(.*?)<\/title>/);
        const linkMatch = item.match(/<link>(.*?)<\/link>/);
        const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);

        if (titleMatch && linkMatch) {
          rssResults.push({
            title: titleMatch[1].replace('<![CDATA[', '').replace(']]>', ''),
            url: linkMatch[1],
            snippet: pubDateMatch ? `Published: ${pubDateMatch[1]}` : 'News Article'
          });
        }
      }

      if (rssResults.length > 0) {
        return rssResults;
      }
    } catch (rssError) {
      console.error('[Search Sources] Google RSS fallback failed:', rssError);
    }

    // Fallback 2: Try instant answer API if scrape fails
    try {
      const iaUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;
      const response = await axios.get(iaUrl);
      const data = response.data;

      const fallbackResults: SearchResult[] = [];

      // Add AbstractURL if present
      if (data.AbstractURL && data.Heading) {
        fallbackResults.push({
          title: data.Heading,
          url: data.AbstractURL,
          snippet: data.AbstractText || 'Encyclopedia entry'
        });
      }

      // Add RelatedTopics
      if (data.RelatedTopics) {
        data.RelatedTopics.slice(0, maxResults).forEach((t: any) => {
          if (t.FirstURL && t.Text) {
            fallbackResults.push({
              title: t.Text.split(' - ')[0] || 'Source',
              url: t.FirstURL,
              snippet: t.Text
            });
          }
        });
      }

      return fallbackResults;
    } catch (fallbackError) {
      console.error('[Search Sources] Fallback failed:', fallbackError);
      return [];
    }
  }
}

/**
 * Search for sources supporting a claim
 */
export async function searchClaimSources(claim: string): Promise<SearchResult[]> {
  const query = `${claim} proof evidence`;
  return searchSources(query, 5);
}

/**
 * Search for sources supporting a counter-argument
 */
export async function searchCounterArgumentSources(
  counterArgument: string,
  claim?: string
): Promise<SearchResult[]> {
  let query = counterArgument;
  if (claim) {
    query = `${counterArgument} vs "${claim}"`;
  }
  return searchSources(query, 5);
}

/**
 * Search for multiple queries
 */
export async function searchMultipleQueries(
  queries: string[],
  maxResultsPerQuery: number = 3
): Promise<SearchResult[]> {
  const allResults: SearchResult[] = [];
  const seenUrls = new Set<string>();

  for (const query of queries) {
    try {
      const results = await searchSources(query, maxResultsPerQuery);

      for (const result of results) {
        if (!seenUrls.has(result.url)) {
          seenUrls.add(result.url);
          allResults.push(result);
        }
      }
      // Add delay between queries
      await sleep(1000);
    } catch (error) {
      console.error(`[Search Sources] Error searching query "${query}":`, error);
    }
  }

  return allResults;
}
