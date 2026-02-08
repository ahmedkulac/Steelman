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
const prisma = new PrismaClient();

// Helper function to safely parse JSON string
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

// Helper function to format claim response with parsed JSON
function formatClaimResponse(claim: any) {
  return {
    ...claim,
    steelmanArguments: parseSteelmanArguments(claim.steelmanArguments),
  };
}

// Validation schemas
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

// POST /api/claims - Submit a new claim for fact-checking
router.post('/', claimRateLimiter, async (req: Request, res: Response) => {
  try {
    // Validate input
    const validationResult = createClaimSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: validationResult.error.errors,
      });
    }

    const { claim, category, context } = validationResult.data;

    // Check cache first
    const cacheKey = generateCacheKey(claim);
    const cachedResult = await getCache(`claim:${cacheKey}`);

    if (cachedResult) {
      const cachedData = JSON.parse(cachedResult);
      // Create a new claim record with cached data
      const savedClaim = await prisma.claim.create({
        data: {
          content: claim,
          category: category || null,
          steelmanArguments: JSON.stringify(cachedData.counterArguments),
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
    const newClaim = await prisma.claim.create({
      data: {
        content: claim,
        category: category || null,
        processingStatus: 'processing',
        ipAddress: req.ip || null,
        userAgent: req.get('user-agent') || null,
      },
    });

    // Generate steelman argument asynchronously
    generateSteelmanArgument({ claim, category, context })
      .then(async (result) => {
        // Update claim with results
        await prisma.claim.update({
          where: { id: newClaim.id },
          data: {
            steelmanArguments: JSON.stringify(result.counterArguments),
            confidenceScore: result.confidence,
            processingStatus: 'completed',
          },
        });

        // Cache the result
        await setCache(
          `claim:${cacheKey}`,
          JSON.stringify({
            counterArguments: result.counterArguments,
            confidence: result.confidence,
            relatedTopics: result.relatedTopics,
          }),
          604800
        ); // 7 days
      })
      .catch(async (error) => {
        console.error('Error generating steelman argument:', error);
        await prisma.claim.update({
          where: { id: newClaim.id },
          data: {
            processingStatus: 'failed',
            errorMessage: error.message,
          },
        });
      });

    // Return immediately with pending status
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

// GET /api/claims/:id - Get a specific claim and its results
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const claim = await prisma.claim.findUnique({
      where: { id },
      include: {
        feedbacks: {
          take: 10,
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

    return res.json(formatClaimResponse(claim));
  } catch (error) {
    console.error('Error fetching claim:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch claim',
    });
  }
});

// GET /api/claims - List claims with pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;
    const category = req.query.category as string | undefined;

    const where = category ? { category } : {};

    const [claims, total] = await Promise.all([
      prisma.claim.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          category: true,
          processingStatus: true,
          confidenceScore: true,
          createdAt: true,
          steelmanArguments: true, // Include to parse if needed
        },
      }),
      prisma.claim.count({ where }),
    ]);

    return res.json({
      claims: claims.map(formatClaimResponse),
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

// POST /api/claims/:id/feedback - Submit feedback on a claim
router.post('/:id/feedback', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, helpful, comment } = req.body;

    // Validate feedback
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Rating must be between 1 and 5',
      });
    }

    // Check if claim exists
    const claim = await prisma.claim.findUnique({
      where: { id },
    });

    if (!claim) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Claim not found',
      });
    }

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
