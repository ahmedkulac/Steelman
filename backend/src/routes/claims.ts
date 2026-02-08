/**
 * Claims API Routes
 * 
 * Handles all claim-related endpoints:
 * - POST /api/claims - Submit a new claim for fact-checking
 * - GET /api/claims/:id - Get a specific claim and its results
 * - GET /api/claims - List claims with pagination
 * - POST /api/claims/:id/feedback - Submit feedback on a claim
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import {
  generateSteelmanArgument,
  generateCacheKey,
  CounterArgument,
} from '../services/aiService';
import { getCache, setCache } from '../utils/cache';
import { claimRateLimiter } from '../utils/rateLimit';

const router = Router();

// Prisma client instance (singleton pattern)
// Reused across all route handlers for efficient database connections
const prisma = new PrismaClient();

/**
 * Safely parse JSON string to CounterArgument array
 * Used for SQLite compatibility (stores JSON as string)
 * 
 * @param jsonString - JSON string from database
 * @returns Parsed counter arguments array or null if invalid
 */
function parseSteelmanArguments(
  jsonString: string | null | undefined
): CounterArgument[] | null {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing steelmanArguments:', error);
    return null;
  }
}

/**
 * Format claim response by parsing JSON strings to objects
 * Ensures frontend receives properly formatted data
 * 
 * @param claim - Claim object from database
 * @returns Formatted claim with parsed steelmanArguments
 */
function formatClaimResponse(claim: {
  steelmanArguments: string | null | undefined;
  [key: string]: unknown;
}) {
  return {
    ...claim,
    steelmanArguments: parseSteelmanArguments(
      claim.steelmanArguments as string | null | undefined
    ),
  };
}

/**
 * Validation schema for claim submission
 * Uses Zod for type-safe validation
 */
const createClaimSchema = z.object({
  claim: z
    .string()
    .min(10, 'Claim must be at least 10 characters')
    .max(1000, 'Claim must be less than 1000 characters'),
  category: z
    .enum(['politics', 'science', 'health', 'technology', 'economics', 'other'])
    .optional(),
  context: z.string().max(500).optional(),
});

/**
 * POST /api/claims
 * Submit a new claim for fact-checking
 * 
 * Flow:
 * 1. Validate input
 * 2. Check cache for identical claims
 * 3. Create claim record (pending/processing status)
 * 4. Generate steelman arguments asynchronously
 * 5. Return immediately with pending status
 * 
 * Rate limited: 10 requests/hour per IP
 */
router.post('/', claimRateLimiter, async (req: Request, res: Response) => {
  try {
    // Validate input using Zod schema
    const validationResult = createClaimSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: validationResult.error.errors,
      });
    }

    const { claim, category, context } = validationResult.data;

    // Check cache first to avoid duplicate API calls
    const cacheKey = generateCacheKey(claim);
    const cachedResult = await getCache(`claim:${cacheKey}`);

    if (cachedResult) {
      // Return cached result immediately
      const cachedData = JSON.parse(cachedResult);
      const savedClaim = await prisma.claim.create({
        data: {
          content: claim,
          category: category || null,
          steelmanArguments: JSON.stringify(cachedData.counterArguments), // SQLite: store as string
          confidenceScore: cachedData.confidence,
          processingStatus: 'completed',
          ipAddress: req.ip || null,
          userAgent: req.get('user-agent') || null,
        },
      });

      return res.status(200).json({
        ...formatClaimResponse(savedClaim),
        cached: true,
      });
    }

    // Create claim record with pending status
    // AI processing happens asynchronously
    const newClaim = await prisma.claim.create({
      data: {
        content: claim,
        category: category || null,
        processingStatus: 'processing',
        ipAddress: req.ip || null,
        userAgent: req.get('user-agent') || null,
      },
    });

    // Generate steelman argument asynchronously (non-blocking)
    generateSteelmanArgument({ claim, category, context })
      .then(async (result) => {
        // Update claim with AI-generated results
        await prisma.claim.update({
          where: { id: newClaim.id },
          data: {
            steelmanArguments: JSON.stringify(result.counterArguments), // SQLite: store as string
            confidenceScore: result.confidence,
            processingStatus: 'completed',
          },
        });

        // Cache the result for future identical claims (7 days)
        await setCache(
          `claim:${cacheKey}`,
          JSON.stringify({
            counterArguments: result.counterArguments,
            confidence: result.confidence,
            relatedTopics: result.relatedTopics,
          }),
          604800 // 7 days in seconds
        );
      })
      .catch(async (error) => {
        // Handle AI generation errors gracefully
        console.error('Error generating steelman argument:', error);
        await prisma.claim.update({
          where: { id: newClaim.id },
          data: {
            processingStatus: 'failed',
            errorMessage: error.message,
          },
        });
      });

    // Return immediately with pending status (202 Accepted)
    // Frontend will poll for updates
    return res.status(202).json({
      ...formatClaimResponse(newClaim),
      message: 'Claim submitted. Processing in background.',
    });
  } catch (error) {
    console.error('Error creating claim:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process claim submission',
    });
  }
});

/**
 * GET /api/claims/:id
 * Get a specific claim and its results
 * 
 * Returns:
 * - Claim details
 * - Steelman counter-arguments (if processed)
 * - Processing status
 * - Recent feedback (last 10)
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const claim = await prisma.claim.findUnique({
      where: { id },
      include: {
        feedbacks: {
          take: 10, // Limit to last 10 feedback entries
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!claim) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Claim not found',
      });
    }

    // Format response with parsed JSON
    return res.json(formatClaimResponse(claim));
  } catch (error) {
    console.error('Error fetching claim:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch claim',
    });
  }
});

/**
 * GET /api/claims
 * List claims with pagination and optional category filter
 * 
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - category: Filter by category (optional)
 * 
 * Returns paginated list of claims
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100); // Max 100 per page
    const skip = (page - 1) * limit;
    const category = req.query.category as string | undefined;

    // Build where clause for filtering
    const where = category ? { category } : {};

    // Fetch claims and total count in parallel
    const [claims, total] = await Promise.all([
      prisma.claim.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }, // Newest first
        select: {
          id: true,
          content: true,
          category: true,
          processingStatus: true,
          confidenceScore: true,
          createdAt: true,
          steelmanArguments: true, // Include to parse for frontend
        },
      }),
      prisma.claim.count({ where }),
    ]);

    return res.json({
      claims: claims.map(formatClaimResponse), // Parse JSON strings
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching claims:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch claims',
    });
  }
});

/**
 * POST /api/claims/:id/feedback
 * Submit feedback on a claim's counter-arguments
 * 
 * Body:
 * - rating: 1-5 stars (optional)
 * - helpful: boolean (optional)
 * - comment: string (optional)
 */
router.post('/:id/feedback', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, helpful, comment } = req.body;

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Rating must be between 1 and 5',
      });
    }

    // Verify claim exists
    const claim = await prisma.claim.findUnique({
      where: { id },
    });

    if (!claim) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Claim not found',
      });
    }

    // Create feedback record
    const feedback = await prisma.feedback.create({
      data: {
        claimId: id,
        rating: rating || null,
        helpful: helpful ?? null,
        comment: comment || null,
      },
    });

    return res.status(201).json(feedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to submit feedback',
    });
  }
});

export default router;
