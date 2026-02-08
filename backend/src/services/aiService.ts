/**
 * AI Service - Google Gemini Integration
 * 
 * Handles all AI-related operations for generating steelman counter-arguments.
 * Uses Google's Gemini API (gemini-2.5-flash) to analyze claims and generate
 * the strongest possible opposing viewpoints.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createHash } from 'crypto';

// Initialize Google Generative AI client
// Supports both GOOGLE_API_KEY and GEMINI_API_KEY environment variables
const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || ''
);

/**
 * Request interface for steelman argument generation
 */
export interface SteelmanRequest {
  claim: string; // The claim to analyze
  category?: string; // Optional category (politics, science, etc.)
  context?: string; // Optional additional context
}

/**
 * Counter-argument structure returned by AI
 */
export interface CounterArgument {
  argument: string; // Main counter-argument text
  reasoning: string; // Why this counter-argument is strong
  evidence?: string[]; // Supporting evidence points
  strength: number; // Strength score 1-10 (10 = strongest)
}

/**
 * Complete response from AI service
 */
export interface SteelmanResponse {
  counterArguments: CounterArgument[]; // Array of 1-3 counter-arguments
  confidence: number; // Confidence score 0-1 (1 = very confident)
  relatedTopics?: string[]; // Related topics for further research
  processingTime: number; // Time taken in milliseconds
}

/**
 * Generate a cache key from claim content
 * 
 * Normalizes the claim (lowercase, trim, remove extra spaces) and creates
 * a SHA-256 hash for consistent caching of identical claims.
 * 
 * @param claim - The claim text
 * @returns SHA-256 hash of normalized claim
 */
export function generateCacheKey(claim: string): string {
  // Normalize: lowercase, trim, remove extra spaces
  const normalized = claim.toLowerCase().trim().replace(/\s+/g, ' ');
  return createHash('sha256').update(normalized).digest('hex');
}

/**
 * Attempt to repair common JSON issues
 * 
 * Tries to fix common JSON malformation issues like:
 * - Unterminated strings
 * - Unescaped quotes
 * - Missing closing braces
 * 
 * @param jsonString - Potentially malformed JSON string
 * @returns Repaired JSON string (may still be invalid)
 */
function repairJson(jsonString: string): string {
  let repaired = jsonString;
  
  // Remove trailing commas before closing braces/brackets
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
  
  // Count braces to check balance
  const openBraces = (repaired.match(/{/g) || []).length;
  const closeBraces = (repaired.match(/}/g) || []).length;
  const openBrackets = (repaired.match(/\[/g) || []).length;
  const closeBrackets = (repaired.match(/\]/g) || []).length;
  
  // Add missing closing braces
  if (openBraces > closeBraces) {
    repaired += '}'.repeat(openBraces - closeBraces);
  }
  
  // Add missing closing brackets
  if (openBrackets > closeBrackets) {
    repaired += ']'.repeat(openBrackets - closeBrackets);
  }
  
  return repaired;
}

/**
 * Generate steelman counter-arguments using Google Gemini AI
 * 
 * This function:
 * 1. Validates API key configuration
 * 2. Builds the prompt with claim and context
 * 3. Calls Gemini API with JSON response format
 * 4. Parses and validates the response
 * 5. Returns structured counter-arguments
 * 
 * @param request - SteelmanRequest with claim and optional context
 * @returns Promise<SteelmanResponse> with counter-arguments and metadata
 * @throws Error if API key missing or generation fails
 */
export async function generateSteelmanArgument(
  request: SteelmanRequest
): Promise<SteelmanResponse> {
  const startTime = Date.now();

  // Validate API key is configured
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY or GEMINI_API_KEY is not configured');
  }

  // Build the prompt for AI
  const prompt = buildSteelmanPrompt(request);
  
  // Get model name from env or use default (gemini-2.5-flash)
  const modelName = process.env.AI_MODEL || 'gemini-2.5-flash';

  try {
    // Initialize Gemini model with configuration
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7, // Balanced creativity/consistency
        maxOutputTokens: parseInt(process.env.AI_MAX_TOKENS || '2000'),
        responseMimeType: 'application/json', // Force JSON response
      },
      systemInstruction:
        'You are a fact-checking assistant that uses the steelman technique - presenting the strongest possible version of an opposing argument. Your responses must be fair, logical, and intellectually honest. Always respond with valid JSON.',
    });

    // Generate content from AI
    const result = await model.generateContent(prompt);
    const apiResponse = await result.response;
    const content = apiResponse.text();

    if (!content) {
      throw new Error('No response from AI service');
    }

    // Clean up content - remove markdown code blocks if present
    let cleanedContent = content.trim();
    
    // Remove markdown code blocks (case-insensitive)
    if (cleanedContent.match(/^```json/i)) {
      cleanedContent = cleanedContent.replace(/^```json\s*/i, '').replace(/\s*```\s*$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```\s*$/, '');
    }
    
    // Extract JSON object if wrapped in text
    const jsonStart = cleanedContent.indexOf('{');
    const jsonEnd = cleanedContent.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanedContent = cleanedContent.substring(jsonStart, jsonEnd + 1);
    }
    
    // Clean up common JSON issues
    cleanedContent = cleanedContent.trim();
    
    // Parse JSON response with error handling
    let parsed;
    try {
      parsed = JSON.parse(cleanedContent);
    } catch (parseError: any) {
      // Enhanced error handling for malformed JSON
      console.warn('JSON parse error:', parseError.message);
      console.warn('Content preview (first 500 chars):', cleanedContent.substring(0, 500));
      
      // Try to repair common JSON issues
      try {
        const repaired = repairJson(cleanedContent);
        parsed = JSON.parse(repaired);
        console.log('Successfully repaired JSON');
      } catch (repairError: any) {
        // If repair fails, try to extract just the JSON object more aggressively
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const extractedJson = repairJson(jsonMatch[0]);
            parsed = JSON.parse(extractedJson);
            console.log('Successfully extracted and parsed JSON');
          } catch (extractError) {
            // Final fallback - provide helpful error message
            console.error('All JSON repair attempts failed');
            throw new Error(
              `Failed to parse AI response as JSON: ${parseError.message}. ` +
              `The AI may have returned malformed JSON. Please try submitting the claim again. ` +
              `If the issue persists, try rephrasing your claim or contact support.`
            );
          }
        } else {
          throw new Error(
            `Failed to parse AI response as JSON: ${parseError.message}. ` +
            `No valid JSON object found in response. Please try again.`
          );
        }
      }
    }
    const processingTime = Date.now() - startTime;

    // Validate and transform the response
    // Handle different response formats for robustness
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

    // Ensure counterArguments is always an array
    if (!Array.isArray(response.counterArguments)) {
      response.counterArguments = [response.counterArguments];
    }

    // Validate and clamp strength scores to 1-10 range
    response.counterArguments = response.counterArguments.map((arg) => ({
      ...arg,
      strength: Math.max(1, Math.min(10, arg.strength || 5)),
    }));

    return response;
  } catch (error: any) {
    console.error('AI Service Error:', error);
    
    // Provide helpful error messages for common issues
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
 * 
 * Creates a detailed prompt that instructs the AI to:
 * 1. Analyze the claim
 * 2. Generate the strongest possible counter-argument (steelman, not strawman)
 * 3. Use logical reasoning and evidence
 * 4. Maintain intellectual honesty
 * 5. Return structured JSON
 * 
 * @param request - SteelmanRequest with claim and context
 * @returns Formatted prompt string
 */
function buildSteelmanPrompt(request: SteelmanRequest): string {
  const { claim, category, context } = request;

  // Start with the claim
  let prompt = `Analyze the following claim and generate a steelman counter-argument - the strongest possible opposing viewpoint.

Claim: "${claim}"`;

  // Add category if provided
  if (category) {
    prompt += `\n\nCategory: ${category}`;
  }

  // Add context if provided
  if (context) {
    prompt += `\n\nAdditional Context: ${context}`;
  }

  // Add instructions for steelman generation
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

CRITICAL JSON FORMATTING RULES:
- Respond with ONLY valid JSON, no other text before or after
- All strings must be properly escaped (use \\" for quotes inside strings)
- No unescaped newlines in string values (use \\n if needed)
- All quotes must be properly closed
- No trailing commas
- Ensure all braces and brackets are properly closed
- Double-check that your JSON is valid before responding

Important:
- Provide 1-3 counter-arguments (focus on quality over quantity)
- Strength should be 1-10 (10 = strongest possible counter-argument)
- Confidence should be 0-1 (1 = very confident in the counter-argument)
- Evidence should be specific, verifiable points when possible
- Be intellectually honest - if the claim is well-supported, acknowledge that
- Escape all special characters in strings properly (quotes, newlines, etc.)`;

  return prompt;
}
