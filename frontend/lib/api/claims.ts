/**
 * Claims API Client
 * 
 * Type-safe API client for interacting with the claims backend.
 * Provides functions for:
 * - Submitting claims
 * - Retrieving claim results
 * - Listing claims with pagination
 * - Submitting feedback
 * 
 * Features:
 * - Client-side caching for instant results
 * - Automatic cache invalidation
 */

import api from '../api';
import { getCachedClaim, setCachedClaim } from '../cache';

/**
 * Source structure from API
 */
export interface Source {
  title: string;
  url: string;
  snippet?: string;
}

/**
 * Evidence item with optional associated sources
 */
export interface EvidenceItem {
  text: string; // The evidence point text
  sources?: Source[]; // Sources supporting this specific evidence point
}

/**
 * Counter-argument structure from API
 */
export interface CounterArgument {
  argument: string; // Main counter-argument text
  reasoning: string; // Why this counter-argument is strong
  evidence?: (string | EvidenceItem)[]; // Supporting evidence points (can be strings or objects with sources)
  strength: number; // Strength score 1-10
  sources?: Source[]; // Online sources supporting this counter-argument (general sources)
}

/**
 * Claim structure from API
 */
export interface Claim {
  id: string;
  content: string;
  category?: string;
  steelmanArguments?: CounterArgument[];
  confidenceScore?: number; // 0-1
  claimSources?: Source[]; // Online sources supporting the original claim
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request payload for creating a claim
 */
export interface CreateClaimRequest {
  claim: string;
  category?: 'politics' | 'science' | 'health' | 'technology' | 'economics' | 'other';
  context?: string;
}

/**
 * Response from claim creation
 */
export interface CreateClaimResponse extends Claim {
  cached?: boolean; // True if result was from cache
  message?: string; // Status message
}

/**
 * Paginated claims list response
 */
export interface ClaimsListResponse {
  claims: Claim[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Feedback submission payload
 */
export interface FeedbackRequest {
  rating?: number; // 1-5 stars
  helpful?: boolean;
  comment?: string;
}

/**
 * Submit a new claim for fact-checking
 * 
 * Checks cache first, then makes API call if needed.
 * Caches completed results automatically.
 * 
 * @param data - Claim data (text, category, context)
 * @returns Promise resolving to claim response with ID
 */
export async function createClaim(
  data: CreateClaimRequest
): Promise<CreateClaimResponse> {
  // Check cache first
  const cached = getCachedClaim<CreateClaimResponse>(data.claim);
  if (cached && cached.processingStatus === 'completed') {
    return { ...cached, cached: true };
  }

  // Make API call
  const response = await api.post<CreateClaimResponse>('/claims', data);
  const result = response.data;

  // Cache completed results
  if (result.processingStatus === 'completed' && result.steelmanArguments) {
    setCachedClaim(data.claim, result);
  }

  return result;
}

/**
 * Get a specific claim by ID
 * 
 * Note: This doesn't use cache since we need the ID.
 * Cache is used in createClaim() for claim text lookups.
 * 
 * @param id - Claim ID
 * @returns Promise resolving to claim with results
 */
export async function getClaim(id: string): Promise<Claim> {
  const response = await api.get<Claim>(`/claims/${id}`);
  const result = response.data;
  
  // Cache completed results by content for future lookups
  if (result.processingStatus === 'completed' && result.content) {
    setCachedClaim(result.content, result);
  }
  
  return result;
}

/**
 * List claims with pagination and optional category filter
 * 
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 20)
 * @param category - Optional category filter
 * @returns Promise resolving to paginated claims list
 */
export async function listClaims(
  page: number = 1,
  limit: number = 20,
  category?: string
): Promise<ClaimsListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (category) {
    params.append('category', category);
  }
  const response = await api.get<ClaimsListResponse>(`/claims?${params}`);
  return response.data;
}

/**
 * Submit feedback on a claim's counter-arguments
 * 
 * @param claimId - Claim ID
 * @param feedback - Feedback data (rating, helpful, comment)
 */
export async function submitFeedback(
  claimId: string,
  feedback: FeedbackRequest
): Promise<void> {
  await api.post(`/claims/${claimId}/feedback`, feedback);
}
