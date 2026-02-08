import api from '../api';

export interface CounterArgument {
  argument: string;
  reasoning: string;
  evidence?: string[];
  strength: number;
}

export interface Claim {
  id: string;
  content: string;
  category?: string;
  steelmanArguments?: CounterArgument[];
  confidenceScore?: number;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClaimRequest {
  claim: string;
  category?: 'politics' | 'science' | 'health' | 'technology' | 'economics' | 'other';
  context?: string;
}

export interface CreateClaimResponse extends Claim {
  cached?: boolean;
  message?: string;
}

export interface ClaimsListResponse {
  claims: Claim[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FeedbackRequest {
  rating?: number;
  helpful?: boolean;
  comment?: string;
}

/**
 * Submit a new claim for fact-checking
 */
export async function createClaim(
  data: CreateClaimRequest
): Promise<CreateClaimResponse> {
  const response = await api.post<CreateClaimResponse>('/claims', data);
  return response.data;
}

/**
 * Get a specific claim by ID
 */
export async function getClaim(id: string): Promise<Claim> {
  const response = await api.get<Claim>(`/claims/${id}`);
  return response.data;
}

/**
 * List claims with pagination
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
 * Submit feedback on a claim
 */
export async function submitFeedback(
  claimId: string,
  feedback: FeedbackRequest
): Promise<void> {
  await api.post(`/claims/${claimId}/feedback`, feedback);
}
