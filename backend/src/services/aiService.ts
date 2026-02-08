import { GoogleGenerativeAI } from '@google/generative-ai';
import { createHash } from 'crypto';

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || ''
);

export interface SteelmanRequest {
  claim: string;
  category?: string;
  context?: string;
}

export interface CounterArgument {
  argument: string;
  reasoning: string;
  evidence?: string[];
  strength: number; // 1-10
}

export interface SteelmanResponse {
  counterArguments: CounterArgument[];
  confidence: number; // 0-1
  relatedTopics?: string[];
  processingTime: number;
}

/**
 * Generate a cache key from the claim content
 */
export function generateCacheKey(claim: string): string {
  // Normalize the claim: lowercase, trim, remove extra spaces
  const normalized = claim.toLowerCase().trim().replace(/\s+/g, ' ');
  return createHash('sha256').update(normalized).digest('hex');
}

/**
 * Generate steelman counter-arguments using AI
 */
export async function generateSteelmanArgument(
  request: SteelmanRequest
): Promise<SteelmanResponse> {
  const startTime = Date.now();

  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY or GEMINI_API_KEY is not configured');
  }

  const prompt = buildSteelmanPrompt(request);
  // Default to gemini-2.5-flash (latest balanced model)
  const modelName = process.env.AI_MODEL || 'gemini-2.5-flash';

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: parseInt(process.env.AI_MAX_TOKENS || '2000'),
        responseMimeType: 'application/json',
      },
      systemInstruction:
        'You are a fact-checking assistant that uses the steelman technique - presenting the strongest possible version of an opposing argument. Your responses must be fair, logical, and intellectually honest. Always respond with valid JSON.',
    });

    const result = await model.generateContent(prompt);
    const apiResponse = await result.response;
    const content = apiResponse.text();

    if (!content) {
      throw new Error('No response from AI service');
    }

    // Clean up the content in case there are markdown code blocks
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(cleanedContent);
    const processingTime = Date.now() - startTime;

    // Validate and transform the response
    const response: SteelmanResponse = {
      counterArguments: parsed.counterArguments || [
        {
          argument: parsed.argument || parsed.counterArgument || '',
          reasoning: parsed.reasoning || '',
          evidence: parsed.evidence || [],
          strength: parsed.strength || parsed.strengthScore || 5,
        },
      ],
      confidence: parsed.confidence || 0.5,
      relatedTopics: parsed.relatedTopics || [],
      processingTime,
    };

    // Ensure counterArguments is an array
    if (!Array.isArray(response.counterArguments)) {
      response.counterArguments = [response.counterArguments];
    }

    // Validate strength scores
    response.counterArguments = response.counterArguments.map((arg) => ({
      ...arg,
      strength: Math.max(1, Math.min(10, arg.strength || 5)),
    }));

    return response;
  } catch (error: any) {
    console.error('AI Service Error:', error);
    
    // If model not found, suggest alternatives
    if (error?.message?.includes('not found') || error?.message?.includes('404')) {
      const suggestions = [
        'Try setting AI_MODEL=gemini-2.5-flash in your .env file (current)',
        'Or try AI_MODEL=gemini-pro as fallback',
        'Available models: gemini-2.5-flash, gemini-2.5-pro, gemini-pro, gemini-1.0-pro',
      ];
      throw new Error(
        `Model "${modelName}" not found. ${suggestions.join('. ')}. Original error: ${error.message}`
      );
    }
    
    throw new Error(
      `Failed to generate steelman argument: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Build the prompt for steelman argument generation
 */
function buildSteelmanPrompt(request: SteelmanRequest): string {
  const { claim, category, context } = request;

  let prompt = `Analyze the following claim and generate a steelman counter-argument - the strongest possible opposing viewpoint.

Claim: "${claim}"`;

  if (category) {
    prompt += `\n\nCategory: ${category}`;
  }

  if (context) {
    prompt += `\n\nAdditional Context: ${context}`;
  }

  prompt += `\n\nGenerate a steelman counter-argument that:
1. Presents the strongest possible opposing viewpoint
2. Uses logical reasoning and evidence-based arguments
3. Addresses the claim fairly and charitably (steelman, not strawman)
4. Highlights potential weaknesses or alternative perspectives
5. Maintains intellectual honesty and avoids fallacies

You must respond with ONLY a valid JSON object (no markdown, no code blocks, no explanation) in this exact format:
{
  "counterArguments": [
    {
      "argument": "The main counter-argument text (2-4 sentences)",
      "reasoning": "Why this counter-argument is strong (2-3 sentences)",
      "evidence": ["Evidence point 1", "Evidence point 2"],
      "strength": 8
    }
  ],
  "confidence": 0.85,
  "relatedTopics": ["topic1", "topic2"]
}

Important:
- Respond with ONLY valid JSON, no other text
- Provide 1-3 counter-arguments (focus on quality over quantity)
- Strength should be 1-10 (10 = strongest possible counter-argument)
- Confidence should be 0-1 (1 = very confident in the counter-argument)
- Evidence should be specific, verifiable points when possible
- Be intellectually honest - if the claim is well-supported, acknowledge that`;

  return prompt;
}
