/**
 * AI Service - Google Gemini Integration
 * 
 * Handles all AI-related operations for generating steelman counter-arguments.
 * Uses Google's Gemini API (gemini-2.5-flash) to analyze claims and generate
 * the strongest possible opposing viewpoints.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createHash } from 'crypto';
import { searchClaimSources, searchCounterArgumentSources } from '../utils/searchSources';

// Initialize Google Generative AI client lazily
let genAIInstance: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAIInstance) {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GOOGLE_API_KEY or GEMINI_API_KEY must be set in environment variables'
      );
    }
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return genAIInstance;
}

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
  sources?: Array<{ // Online sources supporting this counter-argument
    title: string;
    url: string;
    snippet?: string;
  }>;
}

/**
 * Complete response from AI service
 */
export interface SteelmanResponse {
  counterArguments: CounterArgument[]; // Array of 1-3 counter-arguments
  confidence: number; // Confidence score 0-1 (1 = very confident)
  relatedTopics?: string[]; // Related topics for further research
  claimSources?: Array<{ // Online sources supporting the original claim
    title: string;
    url: string;
    snippet?: string;
  }>;
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

  // Fix unterminated strings by tracking string state
  let result = '';
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < repaired.length; i++) {
    const char = repaired[i];
    const nextChar = i < repaired.length - 1 ? repaired[i + 1] : null;

    if (escapeNext) {
      result += char;
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      result += char;
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      // Check if it's an escaped quote that wasn't properly escaped
      // e.g. "Some "quote" text" -> "Some \"quote\" text"
      // Heuristic: if we are inside a string, and the next char is NOT a comma, closing brace, or closing bracket,
      // and the previous char was not an escape, then this might be an inner quote that needs escaping.
      // However, we also need to detect the END of the string.
      // Typically the end of a string is followed by: , } ] or :

      if (inString) {
        // Look ahead to see if this looks like a valid string terminator
        let isTerminator = false;
        let j = i + 1;
        while (j < repaired.length && /\s/.test(repaired[j])) j++;

        if (j < repaired.length) {
          const nextNonSpace = repaired[j];
          if (nextNonSpace === ',' || nextNonSpace === '}' || nextNonSpace === ']' || nextNonSpace === ':') {
            isTerminator = true;
          }
        }

        if (isTerminator) {
          inString = false;
        } else {
          // It's likely an unescaped quote inside the string
          result += '\\"';
          continue;
        }
      } else {
        inString = true;
      }

      result += char;
      continue;
    }

    if (inString) {
      // Handle unescaped control characters
      if (char === '\n') { result += '\\n'; continue; }
      if (char === '\r') { continue; } // Ignore CR
      if (char === '\t') { result += '\\t'; continue; }
    }

    result += char;
  }

  // If we ended while still in a string, close it
  if (inString) {
    result += '"';
  }

  repaired = result;

  // Count braces to check balance (only count braces outside strings)
  let openBraces = 0;
  let closeBraces = 0;
  let openBrackets = 0;
  let closeBrackets = 0;
  inString = false;
  escapeNext = false;

  for (let i = 0; i < repaired.length; i++) {
    const char = repaired[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') openBraces++;
      else if (char === '}') closeBraces++;
      else if (char === '[') openBrackets++;
      else if (char === ']') closeBrackets++;
    }
  }

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
 * Check if a string looks like a URL
 */
function looksLikeUrl(str: string): boolean {
  // Simple heuristic: URLs typically start with http:// or https://
  return /^https?:\/\//i.test(str.trim());
}


/**
 * Aggressively repair unterminated strings by finding likely end positions
 * This is a last-resort repair that tries to close strings at logical boundaries
 * 
 * @param jsonString - JSON string with potentially unterminated strings
 * @returns Repaired JSON string
 */
function aggressivelyRepairStrings(jsonString: string): string {
  let result = '';
  let inString = false;
  let escapeNext = false;
  let charsSinceQuote = 0;
  let stringStart = -1;
  let stringContent = '';

  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString[i];
    const nextChar = i < jsonString.length - 1 ? jsonString[i + 1] : null;

    if (escapeNext) {
      result += char;
      escapeNext = false;
      if (inString) {
        charsSinceQuote++;
        stringContent += char;
      }
      continue;
    }

    if (char === '\\') {
      result += char;
      escapeNext = true;
      if (inString) {
        charsSinceQuote++;
        stringContent += char;
      }
      continue;
    }

    if (char === '"') {
      if (inString) {
        // Closing quote - check if we have a URL that might need special handling
        inString = false;
        charsSinceQuote = 0;
        stringContent = '';
        stringStart = -1;
      } else {
        // Opening quote
        inString = true;
        charsSinceQuote = 0;
        stringStart = result.length;
        stringContent = '';
      }
      result += char;
      continue;
    }

    if (inString) {
      charsSinceQuote++;
      stringContent += char;

      // If we hit an unescaped newline, close the string (newlines must be escaped in JSON strings)
      if (char === '\n' || char === '\r') {
        result += '"';
        inString = false;
        charsSinceQuote = 0;
        stringContent = '';
        stringStart = -1;
        // Skip the newline as it's not valid in JSON strings
        continue;
      }

      // Special handling for URLs: if we detect a URL pattern and then see structural chars,
      // the URL might have ended without a closing quote
      if (looksLikeUrl(stringContent)) {
        // We're building a URL - be careful about when to close it
        // URLs can contain many special chars, so we need to be smart

        // If we see whitespace or structural chars after what looks like a complete URL, close it
        if (/\s/.test(char)) {
          // Look ahead to see what comes after whitespace
          let j = i + 1;
          while (j < jsonString.length && /\s/.test(jsonString[j])) j++;

          if (j < jsonString.length) {
            const afterWhitespace = jsonString[j];
            // If we see structural characters, close the URL string
            if (afterWhitespace === ',' || afterWhitespace === '}' || afterWhitespace === ']' ||
              afterWhitespace === '"' || (afterWhitespace === ':' && j > i + 3)) {
              result += '"';
              inString = false;
              charsSinceQuote = 0;
              stringContent = '';
              stringStart = -1;
              result += char;
              continue;
            }
          }
        }

        // If we see a quote-like character that might indicate end of URL (rare but possible)
        // Actually, don't do this - quotes in URLs should be escaped

        // If URL is getting very long and we see structural chars, it might be malformed
        if (charsSinceQuote > 200 && (char === ',' || char === '}' || char === ']')) {
          // URL seems too long, might be malformed - close it
          result += '"';
          inString = false;
          charsSinceQuote = 0;
          stringContent = '';
          stringStart = -1;
          result += char;
          continue;
        }
      }

      // If we have substantial content and then see whitespace followed by structural chars,
      // it's likely the string should have ended
      if (charsSinceQuote > 10 && /\s/.test(char) && !looksLikeUrl(stringContent)) {
        // Look ahead to see what comes after whitespace
        let j = i + 1;
        while (j < jsonString.length && /\s/.test(jsonString[j])) j++;

        if (j < jsonString.length) {
          const afterWhitespace = jsonString[j];
          // If we see structural characters that typically follow string values, close the string
          if (afterWhitespace === ',' || afterWhitespace === '}' || afterWhitespace === ']') {
            result += '"';
            inString = false;
            charsSinceQuote = 0;
            stringContent = '';
            stringStart = -1;
            result += char;
            continue;
          }
          // If we see a colon, it might be starting a new key, so close the string
          if (afterWhitespace === ':' && j > i + 5) { // Make sure there's enough whitespace
            result += '"';
            inString = false;
            charsSinceQuote = 0;
            stringContent = '';
            stringStart = -1;
            result += char;
            continue;
          }
        }
      }

      result += char;
    } else {
      result += char;
    }
  }

  // Close any remaining unterminated strings at the end
  if (inString) {
    result += '"';
  }

  return result;
}

/**
 * Extract valid JSON from potentially malformed response
 * Tries multiple strategies to find and extract valid JSON
 * 
 * @param content - Raw content from AI response
 * @returns Extracted JSON string or null if extraction fails
 */
function extractValidJson(content: string): string | null {
  // Strategy 1: Find JSON object boundaries
  const jsonStart = content.indexOf('{');
  if (jsonStart === -1) return null;

  // Try to find matching closing brace
  let braceCount = 0;
  let inString = false;
  let escapeNext = false;
  let jsonEnd = -1;

  for (let i = jsonStart; i < content.length; i++) {
    const char = content[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          jsonEnd = i;
          break;
        }
      }
    }
  }

  // If we found a complete JSON object, return it
  if (jsonEnd !== -1 && jsonEnd > jsonStart) {
    return content.substring(jsonStart, jsonEnd + 1);
  }

  // Strategy 2: Try to find last complete JSON object
  const lastBrace = content.lastIndexOf('}');
  if (lastBrace !== -1 && lastBrace > jsonStart) {
    // Try parsing from start to last brace
    const candidate = content.substring(jsonStart, lastBrace + 1);
    try {
      JSON.parse(candidate);
      return candidate;
    } catch {
      // Continue to repair attempt
    }
  }

  // Strategy 3: Return the content from first brace onwards (will be repaired)
  return content.substring(jsonStart);
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

  // API key is validated at module load, but double-check for runtime changes
  const currentApiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!currentApiKey) {
    throw new Error('GOOGLE_API_KEY or GEMINI_API_KEY is not configured');
  }

  // Build the prompt for AI
  const prompt = buildSteelmanPrompt(request);

  // Get model name from env or use default (gemini-2.5-flash)
  const modelName = process.env.AI_MODEL || 'gemini-2.5-flash';

  try {
    // Initialize Gemini model with configuration
    const model = getGenAI().getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.75, // Slightly higher for better argument diversity while maintaining consistency
        maxOutputTokens: parseInt(process.env.AI_MAX_TOKENS || '2000'),
        responseMimeType: 'application/json', // Force JSON response
      },
      systemInstruction:
        'You are an expert fact-checker and truth-teller specializing in aggressive, evidence-based counter-arguments. Your mission is to challenge claims with hard facts and compelling logic that change people\'s perceptions.\n\n' +
        'CORE PRINCIPLES:\n' +
        '1. Truth First: Prioritize factual accuracy and verifiable evidence above all else\n' +
        '2. Direct Confrontation: Challenge claims directly and forcefully with evidence, not gentle suggestions\n' +
        '3. Perception Change: Craft arguments designed to shift the reader\'s understanding and viewpoint\n' +
        '4. Evidence-Based Aggression: Be assertive and uncompromising, but always grounded in facts\n' +
        '5. Intellectual Honesty: Never misrepresent facts, but present them in the most compelling way\n\n' +
        'Your responses must always be:\n' +
        '- Direct, forceful, and persuasive\n' +
        '- Grounded in verifiable facts, studies, and data\n' +
        '- Designed to challenge and change perceptions\n' +
        '- Structurally sound and logically rigorous\n' +
        '- Structured as valid JSON without markdown formatting\n' +
        '- Free of logical fallacies, but unafraid to be assertive\n\n' +
        'Remember: Your goal is to present the truth so compellingly that it changes minds. Be aggressive with facts, direct with logic, and unapologetic about challenging false or misleading claims.',
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

    // Clean up common JSON issues
    cleanedContent = cleanedContent.trim();

    // Parse JSON response with error handling
    let parsed;
    try {
      parsed = JSON.parse(cleanedContent);
    } catch (parseError: unknown) {
      // Enhanced error handling for malformed JSON
      // Log error details for debugging (only in development)
      const errorMessage =
        parseError instanceof Error ? parseError.message : 'Unknown error';
      if (process.env.NODE_ENV === 'development') {
        console.warn('[AI Service] JSON parse error:', errorMessage);
        console.warn('[AI Service] Content preview (first 500 chars):', cleanedContent.substring(0, 500));
        if (errorMessage.includes('position')) {
          const positionMatch = errorMessage.match(/position (\d+)/);
          if (positionMatch) {
            const pos = parseInt(positionMatch[1]);
            const start = Math.max(0, pos - 100);
            const end = Math.min(cleanedContent.length, pos + 100);
            const context = cleanedContent.substring(start, end);
            console.warn('[AI Service] Error context (position', pos, '):', context);

            // Check if error is near a URL pattern
            if (/https?:\/\//i.test(context)) {
              console.warn('[AI Service] Error appears to be near a URL - this may be an unterminated URL string');
              // Try to find the URL in the context
              const urlMatch = context.match(/https?:\/\/[^\s"']+/i);
              if (urlMatch) {
                console.warn('[AI Service] Detected URL near error:', urlMatch[0]);
              }
            }
          }
        }
      }

      // Strategy 1: Try to extract valid JSON using smart extraction
      let extractedJson = extractValidJson(cleanedContent);
      if (extractedJson && extractedJson !== cleanedContent) {
        try {
          parsed = JSON.parse(extractedJson);
          if (process.env.NODE_ENV === 'development') {
            console.log('[AI Service] Successfully extracted valid JSON');
          }
        } catch {
          // Continue to repair attempt
        }
      }

      // Strategy 2: Try to repair JSON (either extracted or original)
      if (!parsed) {
        const jsonToRepair = extractedJson || cleanedContent;
        try {
          const repaired = repairJson(jsonToRepair);
          parsed = JSON.parse(repaired);
          if (process.env.NODE_ENV === 'development') {
            console.log('[AI Service] Successfully repaired JSON');
          }
        } catch (repairError: unknown) {
          // Strategy 3: Try aggressive string repair
          try {
            const aggressivelyRepaired = aggressivelyRepairStrings(jsonToRepair);
            const finalRepaired = repairJson(aggressivelyRepaired);
            parsed = JSON.parse(finalRepaired);
            if (process.env.NODE_ENV === 'development') {
              console.log('[AI Service] Successfully repaired JSON with aggressive repair');
            }
          } catch (aggressiveError: unknown) {
            // Final fallback - provide helpful error message
            if (process.env.NODE_ENV === 'development') {
              console.error('[AI Service] All JSON repair attempts failed');
              console.error('[AI Service] Original error:', errorMessage);
              console.error('[AI Service] Attempted to repair:', jsonToRepair.substring(0, 200));
              if (errorMessage.includes('position')) {
                const positionMatch = errorMessage.match(/position (\d+)/);
                if (positionMatch) {
                  const pos = parseInt(positionMatch[1]);
                  const start = Math.max(0, pos - 100);
                  const end = Math.min(jsonToRepair.length, pos + 100);
                  console.error('[AI Service] Error position context:', jsonToRepair.substring(start, end));
                }
              }
            }
            throw new Error(
              `Failed to parse AI response as JSON: ${errorMessage}. ` +
              `The AI may have returned malformed JSON. Please try submitting the claim again. ` +
              `If the issue persists, try rephrasing your claim or contact support.`
            );
          }
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

    // Search for sources to support the claim and counter-arguments
    try {
      // Search for sources supporting the original claim
      const claimSources = await searchClaimSources(request.claim);
      if (claimSources.length > 0) {
        response.claimSources = claimSources.map(source => ({
          title: source.title,
          url: source.url,
          snippet: source.snippet,
        }));
      }

      // Search for sources supporting each counter-argument
      const counterArgumentSourcesPromises = response.counterArguments.map(async (arg) => {
        const sources = await searchCounterArgumentSources(arg.argument, request.claim);
        return sources.map(source => ({
          title: source.title,
          url: source.url,
          snippet: source.snippet,
        }));
      });

      const counterArgumentSources = await Promise.all(counterArgumentSourcesPromises);

      // Add sources to each counter-argument
      response.counterArguments = response.counterArguments.map((arg, index) => ({
        ...arg,
        sources: counterArgumentSources[index] || [],
      }));
    } catch (searchError) {
      // Log search errors but don't fail the request
      const errorMessage = searchError instanceof Error ? searchError.message : 'Unknown error';
      console.warn('[AI Service] Error searching for sources:', errorMessage);
      // Continue without sources - the response is still valid
    }

    return response;
  } catch (error: unknown) {
    // Log errors for debugging (always log errors)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('[AI Service] Error:', errorMessage);
    if (process.env.NODE_ENV === 'development' && error instanceof Error) {
      console.error('[AI Service] Stack:', error.stack);
    }

    // Provide helpful error messages for common issues
    if (
      errorMessage.includes('not found') ||
      errorMessage.includes('404')
    ) {
      const suggestions = [
        'Try setting AI_MODEL=gemini-2.5-flash in your .env file (current)',
        'Or try AI_MODEL=gemini-pro as fallback',
        'Available models: gemini-2.5-flash, gemini-2.5-pro, gemini-pro, gemini-1.0-pro',
      ];
      throw new Error(
        `Model "${modelName}" not found. ${suggestions.join('. ')}. Original error: ${errorMessage}`
      );
    }

    throw new Error(
      `Failed to generate steelman argument: ${errorMessage}`
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

  let prompt = `You are an expert critical thinking assistant specializing in the steelman technique. Your task is to analyze a claim and construct the strongest possible opposing argument.

CLAIM TO ANALYZE:
"${claim}"`;

  if (category) {
    prompt += `\n\nCATEGORY: ${category}`;
  }

  if (context) {
    prompt += `\n\nADDITIONAL CONTEXT: ${context}`;
  }

  prompt += `\n\nAGGRESSIVE TRUTH-BASED COUNTER-ARGUMENT GUIDELINES:
Your goal is to create powerful, evidence-driven counter-arguments that challenge the claim and change the reader's perception. Be direct, forceful, and uncompromising with the truth.

To create an effective counter-argument:
1. **Direct Confrontation**: Challenge the claim head-on with facts. Don't be gentle - be truthful and assertive.
2. **Evidence-First Approach**: Lead with the strongest, most damning evidence. Use specific data, studies, and verifiable facts.
3. **Attack Core Premises**: Identify and dismantle the fundamental assumptions or logic errors in the claim.
4. **Truth Over Politeness**: Prioritize factual accuracy and logical rigor over being diplomatic. The truth should be presented forcefully.
5. **Perception Change Focus**: Structure your argument to shift understanding. Use compelling evidence and logic that makes the reader reconsider.
6. **No False Balance**: If the claim is wrong or misleading, say so directly. Don't create false equivalence.

WHAT MAKES A POWERFUL COUNTER-ARGUMENT:
- Hard, verifiable facts that directly contradict the claim
- Specific data, studies, statistics, or expert consensus
- Logical reasoning that exposes flaws in the claim's foundation
- Historical examples or precedents that undermine the claim
- Direct challenges to the claim's core assumptions
- Evidence presented in a way that forces reconsideration

TONE AND STYLE:
- Be direct and assertive, not wishy-washy
- Use strong, confident language backed by evidence
- Challenge falsehoods directly - don't hedge
- Present facts in a compelling, persuasive manner
- Focus on changing perception through truth and logic

WHAT TO AVOID:
- Being overly charitable to false or misleading claims
- Hedging or weakening your position unnecessarily
- False balance or "both sides" when one side is clearly wrong
- Softening the truth to be polite
- Avoiding direct confrontation when facts demand it
- Making unsupported assertions (always ground in evidence)

RESPONSE FORMAT:
You must respond with ONLY valid JSON (no markdown, no code blocks, no explanatory text) in this exact structure:
{
  "counterArguments": [
    {
      "argument": "A direct, forceful, and evidence-based counter-argument (4-6 sentences that aggressively challenge the claim with facts and logic)",
      "reasoning": "Explanation of why this counter-argument is compelling and why it should change the reader's perception (3-5 sentences)",
      "evidence": ["Specific evidence point 1 (be concrete: cite types of studies, data patterns, or logical principles)", "Specific evidence point 2", "Specific evidence point 3"],
      "strength": 8
    }
  ],
  "confidence": 0.85,
  "relatedTopics": ["Related topic 1", "Related topic 2", "Related topic 3"]
}

QUALITY STANDARDS:
- Provide 1-3 counter-arguments (prioritize powerful, perception-changing arguments)
- Each argument should be substantial (4-6 sentences minimum) and directly confrontational
- Evidence must be specific, verifiable, and compelling (cite actual studies, data, or expert consensus)
- Arguments should be designed to change perception - use facts aggressively
- Strength rating (1-10): Rate based on how compelling, evidence-based, and perception-changing the counter-argument is
  - 1-3: Weak counter-argument with little evidence or impact
  - 4-6: Moderate counter-argument with some evidence but limited persuasive power
  - 7-8: Strong counter-argument with solid evidence that challenges the claim effectively
  - 9-10: Exceptionally powerful counter-argument with compelling evidence that should definitively change perception
- Confidence (0-1): Your confidence that this counter-argument is truthful, well-evidenced, and persuasive
- Related topics should be specific and relevant (not generic terms)
- Focus on arguments that will make the reader reconsider their position
- Note: Sources will be added automatically after your response, so you don't need to include them in the JSON

CRITICAL JSON FORMATTING REQUIREMENTS:
- Output ONLY valid JSON - no text before or after the JSON object
- All strings must be properly escaped:
  - Use \\" for quotes inside strings: "argument": "He said \\"hello\\""
  - Use \\n for newlines: "argument": "Line 1\\nLine 2"
  - Escape backslashes: "path": "C:\\\\Users\\\\file.txt"
- Every opening quote " must have a matching closing quote "
- No trailing commas after the last item in arrays or objects
- All braces { } and brackets [ ] must be properly closed and balanced
- URLs must be complete strings: "evidence": ["https://example.com/article"]
- Validate your JSON before responding - ensure it can be parsed

SPECIAL HANDLING FOR URLs:
- If the claim is a URL or you include URLs in evidence/relatedTopics, ensure URLs are properly enclosed in quotes
- URLs must be complete strings: "evidence": ["https://example.com/path"] is correct
- URLs must end with a closing quote before commas, brackets, or braces
- Example: "evidence": ["https://www.example.com/article"] is correct
- Example: "evidence": ["https://www.example.com/article] is WRONG (missing closing quote)
- Never leave URLs unquoted or partially quoted in JSON arrays or objects

If you encounter any issues generating a response:
- If a claim is too vague or unclear, challenge the vagueness itself and provide counter-arguments based on the most reasonable interpretations
- If a claim is obviously false or misleading, be direct and forceful in explaining why, using the strongest available evidence
- If a claim is true, acknowledge it honestly but still explore potential limitations, nuances, or alternative perspectives that might change perception
- If you lack sufficient information, state what additional context would be needed, but still provide your most aggressive, evidence-based analysis with available information

Now generate your response as valid JSON only:`;

  return prompt;
}

/**
 * Article Analysis Types
 */
export interface ArticleAnalysisRequest {
  title: string;
  content: string; // Extracted article content
  url?: string;
}

interface AnalyzedClaim {
  claim: string;
  quote: string; // Original quote from article
  counterArgument: string;
  reasoning: string;
  source?: string; // Optional source URL
  strength: number; // 1-10
}

export interface ArticleAnalysisResponse {
  summary: string;
  claims: AnalyzedClaim[];
  biasScore: number; // 1-10 (1=neutral, 10=highly biased)
  biasAnalysis: string;
  processingTime: number;
}

/**
 * Analyze an article to find controversial claims and generate counter-arguments
 */
export async function analyzeArticle(
  request: ArticleAnalysisRequest
): Promise<ArticleAnalysisResponse> {
  const startTime = Date.now();

  // Validate API key (already checked at module load, but double-check)
  const currentApiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!currentApiKey) {
    throw new Error('GOOGLE_API_KEY or GEMINI_API_KEY is not configured');
  }

  const modelName = process.env.AI_MODEL || 'gemini-2.5-flash';

  // Truncate content if too long (approx 25k chars/tokens limit safety)
  // Gemini 1.5/2.0 handle large context, but let's be safe
  const contentToAnalyze = request.content.length > 50000
    ? request.content.substring(0, 50000) + '...[truncated]'
    : request.content;

  const prompt = `You are an expert media analyst specializing in identifying claims, bias, and generating steelman counter-arguments.

ARTICLE TO ANALYZE:
Title: "${request.title}"
${request.url ? `URL: ${request.url}` : ''}

Content:
${contentToAnalyze}

ANALYSIS TASK:
Perform a comprehensive analysis of this article following these steps:

STEP 1: SUMMARY
Create a concise 2-3 sentence summary that captures:
- The main thesis or central argument
- Key supporting points
- The article's overall perspective

STEP 2: CLAIM IDENTIFICATION
Identify 3-5 major controversial, debatable, or fact-claiming statements. Focus on:
- Factual claims that can be verified or disputed
- Causal claims (X causes Y)
- Comparative claims (X is better/worse than Y)
- Predictive claims (X will happen)
- Value judgments presented as facts
- Claims that reasonable people might disagree about

For each claim:
- Extract the EXACT quote from the text (preserve wording and context)
- Identify what TYPE of claim it is (factual, causal, comparative, predictive, value judgment)
- Note why it's controversial or debatable

STEP 3: AGGRESSIVE COUNTER-ARGUMENTS
For each identified claim, generate a direct, evidence-based counter-argument designed to change perception:
- Challenge the claim directly and forcefully with facts
- Use specific, verifiable evidence (studies, data, expert consensus)
- Attack the claim's core premises and logic
- Be uncompromising with the truth - if the claim is wrong, say so directly
- Structure arguments to shift the reader's understanding
- Rate the strength of your counter-argument (1-10) based on evidence and persuasive power

STEP 4: BIAS ASSESSMENT
Evaluate the article's bias using these criteria:
- **Framing**: How are issues presented? What perspectives are emphasized or omitted?
- **Source Selection**: Are sources diverse and credible, or one-sided?
- **Language**: Is language neutral or emotionally charged? Are loaded terms used?
- **Evidence**: Are claims well-supported or rely on weak evidence?
- **Balance**: Are multiple perspectives presented fairly?

Rate bias on a 1-10 scale:
- 1-3: Highly balanced, presents multiple perspectives fairly
- 4-6: Somewhat biased, favors one perspective but acknowledges others
- 7-8: Clearly biased, heavily favors one perspective with limited balance
- 9-10: Highly biased/propagandistic, presents only one perspective, uses manipulative techniques

Provide a detailed explanation of your bias rating.

RESPONSE FORMAT (valid JSON only, no markdown):
{
  "summary": "2-3 sentence summary of the article's main thesis and key points",
  "claims": [
    {
      "claim": "A clear statement of what claim is being made (paraphrased for clarity)",
      "quote": "Exact quote from the article text",
      "counterArgument": "Direct, aggressive, evidence-based counter-argument that challenges the claim (4-6 sentences)",
      "reasoning": "Explanation of why this counter-argument is compelling and should change perception (3-5 sentences)",
      "strength": 8
    }
  ],
  "biasScore": 6,
  "biasAnalysis": "Detailed explanation of bias assessment, including specific examples from the article (3-5 sentences)"
}

QUALITY REQUIREMENTS:
- Identify 3-5 claims (prioritize the most significant/debatable ones)
- Each counter-argument should be substantial and well-reasoned
- Bias analysis should cite specific examples from the text
- All JSON must be valid and properly formatted (escape quotes, no trailing commas, etc.)
- Quotes must be exact text from the article

CRITICAL JSON FORMATTING REQUIREMENTS:
- Output ONLY valid JSON - no text before or after the JSON object
- All strings must be properly escaped (use \\" for quotes, \\n for newlines)
- Every opening quote " must have a matching closing quote "
- No trailing commas after the last item in arrays or objects
- All braces { } and brackets [ ] must be properly closed and balanced
- Validate your JSON before responding

Generate your analysis now as valid JSON only:`;

  try {
    const model = getGenAI().getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.3, // Lower temperature for analysis
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON (reuse existing logic or simple parse if robust)
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      // Simple cleanup attempt
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanText);
    }

    return {
      summary: parsed.summary || 'No summary available',
      claims: parsed.claims || [],
      biasScore: parsed.biasScore || 5,
      biasAnalysis: parsed.biasAnalysis || 'No bias analysis available',
      processingTime: Date.now() - startTime,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AI Service] Article Analysis Error:', errorMessage);
    if (process.env.NODE_ENV === 'development' && error instanceof Error) {
      console.error('[AI Service] Stack:', error.stack);
    }
    throw new Error(`Failed to analyze article: ${errorMessage}`);
  }
}
