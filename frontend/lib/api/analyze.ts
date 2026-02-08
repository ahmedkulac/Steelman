/**
 * Analyze API Client
 * 
 * Type-safe API client for analyzing articles and social media posts.
 */

import api from '../api';

/**
 * Analysis result structure from API
 */
export interface Source {
  title: string;
  url: string;
  snippet?: string;
}

export interface AnalyzedClaim {
  claim: string;
  quote: string;
  counterArgument: string;
  reasoning: string;
  sources?: Source[];
  strength: number;
}

export interface FactCheck {
  statement: string;
  quote: string;
  searchQuery: string;
  verdict: 'verified' | 'disputed' | 'misleading' | 'needs_context';
  reasoning: string;
}

export interface AnalysisResult {
  title: string;
  byline?: string;
  excerpt?: string;
  content: string;
  platform?: string; // 'instagram' | 'tiktok' | 'twitter' | 'facebook'
  author?: string; // Social media author/username
  analysis: {
    summary: string;
    claims: AnalyzedClaim[];
    factChecks: FactCheck[];
    biasScore: number;
    biasAnalysis: string;
    processingTime: number;
  };
}

/**
 * Analyze an article or social media post URL
 * 
 * @param url - URL to analyze
 * @returns Promise resolving to analysis result
 */
export async function analyzeUrl(url: string): Promise<AnalysisResult> {
  const response = await api.post<AnalysisResult>('/analyze', { url });
  return response.data;
}
