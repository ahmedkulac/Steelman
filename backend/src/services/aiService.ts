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
 * Evidence item with optional associated sources
 */
export interface EvidenceItem {
  text: string; // The evidence point text
  sources?: Array<{ // Sources supporting this specific evidence point
    title: string;
    url: string;
    snippet?: string;
  }>;
}

/**
 * Counter-argument structure returned by AI
 */
export interface CounterArgument {
  argument: string; // Main counter-argument text
  reasoning: string; // Why this counter-argument is strong
  evidence?: (string | EvidenceItem)[]; // Supporting evidence points (can be strings or objects with sources)
  strength: number; // Strength score 1-10 (10 = strongest)
  sources?: Array<{ // Online sources supporting this counter-argument (general sources)
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
 * Fix missing commas in arrays and objects using multiple strategies
 * 
 * Detects patterns where values are missing commas between them, such as:
 * - "value1" "value2" -> "value1", "value2"
 * - "value" ] -> "value", ]
 * - 123 456 -> 123, 456
 * - } { -> }, {
 * 
 * Uses character-by-character parsing to track string state and avoid
 * modifying content inside strings. Runs multiple passes for better coverage.
 * 
 * @param jsonString - JSON string that may have missing commas
 * @returns JSON string with commas added where needed
 */
function fixMissingCommas(jsonString: string): string {
  // Strategy 1: Character-by-character analysis
  let result = '';
  let inString = false;
  let escapeNext = false;
  let depth = 0; // Track nesting depth

  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString[i];

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
      inString = !inString;
      result += char;
      continue;
    }

    if (!inString) {
      // Track depth
      if (char === '{' || char === '[') depth++;
      else if (char === '}' || char === ']') depth--;

      // Check if we need to add a comma before this character
      const needsCommaBefore = (char === '}' || char === ']' || char === '{' || char === '[' ||
        char === '"' || /\d/.test(char) || char === 't' || char === 'f' || char === 'n');

      if (needsCommaBefore && result.length > 0) {
        // Look backwards to find the end of the previous value
        let j = result.length - 1;
        // Skip whitespace
        while (j >= 0 && /\s/.test(result[j])) j--;

        if (j >= 0) {
          const lastChar = result[j];
          let isValueEnd = false;

          // Check if last character is end of a value
          if (lastChar === '"' || lastChar === '}' || lastChar === ']') {
            isValueEnd = true;
          } else if (/\d/.test(lastChar)) {
            // Might be end of number - check backwards for number pattern
            let k = j;
            while (k >= 0 && (/\d/.test(result[k]) || result[k] === '.' || result[k] === 'e' || result[k] === 'E' || result[k] === '+' || result[k] === '-')) {
              k--;
            }
            // If we hit a non-number char that's a valid separator, it's an end
            if (k < 0 || result[k] === ',' || result[k] === '[' || result[k] === '{' || result[k] === ':') {
              isValueEnd = true;
            }
          } else {
            // Check for true/false/null keywords (check backwards)
            const checkTail = (len: number, match: string) => {
              if (j >= len - 1) {
                const tail = result.substring(j - len + 1, j + 1);
                return tail === match;
              }
              return false;
            };

            if (checkTail(4, 'true') || checkTail(5, 'false') || checkTail(4, 'null')) {
              // Verify it's not part of a longer word by checking char before
              const beforeIdx = j - (checkTail(5, 'false') ? 4 : 3);
              if (beforeIdx < 0 || !/[a-zA-Z0-9_]/.test(result[beforeIdx])) {
                isValueEnd = true;
              }
            }
          }

          if (isValueEnd) {
            // Check if there's already a comma before this value
            let k = j - 1;
            while (k >= 0 && /\s/.test(result[k])) k--;

            // Add comma if we don't already have one and we're not at start of array/object or after colon
            if (k >= 0 && result[k] !== ',' && result[k] !== '[' && result[k] !== '{' && result[k] !== ':') {
              // Special case: don't add comma if we're closing and opening braces/brackets of same type
              if (!((char === '{' && lastChar === '}') || (char === '[' && lastChar === ']'))) {
                result += ',';
              }
            }
          }
        }
      }
    }

    result += char;
  }

  // Strategy 2: Regex-based fix for common patterns (only outside strings)
  // This is a fallback for cases the character-by-character approach might miss
  let repaired = result;
  let passCount = 0;
  const maxPasses = 3;

  while (passCount < maxPasses) {
    let changed = false;
    let newResult = '';
    inString = false;
    escapeNext = false;

    for (let i = 0; i < repaired.length; i++) {
      const char = repaired[i];

      if (escapeNext) {
        newResult += char;
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        newResult += char;
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        newResult += char;
        continue;
      }

      if (!inString) {
        // Look for pattern: value whitespace value (missing comma)
        // Check if current char starts a value and previous ended a value
        if ((char === '"' || char === '{' || char === '[' || /\d/.test(char) || char === 't' || char === 'f' || char === 'n') && i > 0) {
          // Look backwards through whitespace
          let j = i - 1;
          while (j >= 0 && /\s/.test(repaired[j])) j--;

          if (j >= 0) {
            const prevChar = repaired[j];
            // If previous char ends a value and we don't have a comma
            if ((prevChar === '"' || prevChar === '}' || prevChar === ']' || /\d/.test(prevChar)) &&
              repaired.substring(Math.max(0, j - 4), j + 1).match(/(true|false|null)$/) === null) {
              // Check if comma already exists
              let k = j - 1;
              while (k >= 0 && /\s/.test(repaired[k])) k--;
              if (k >= 0 && repaired[k] !== ',' && repaired[k] !== '[' && repaired[k] !== '{' && repaired[k] !== ':') {
                newResult += ',';
                changed = true;
              }
            }
          }
        }
      }

      newResult += char;
    }

    if (!changed) break;
    repaired = newResult;
    passCount++;
  }

  return repaired;
}

/**
 * Attempt to repair common JSON issues
 * 
 * Tries to fix common JSON malformation issues like:
 * - Unterminated strings
 * - Unescaped quotes
 * - Missing closing braces
 * - Missing commas in arrays/objects
 * 
 * @param jsonString - Potentially malformed JSON string
 * @returns Repaired JSON string (may still be invalid)
 */
function repairJson(jsonString: string): string {
  let repaired = jsonString;

  // Remove trailing commas before closing braces/brackets
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1');

  // Fix missing commas first (before other repairs that might change structure)
  repaired = fixMissingCommas(repaired);

  // Fix unterminated strings by tracking string state
  let result = '';
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < repaired.length; i++) {
    const char = repaired[i];

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
  let stringContent = '';

  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString[i];

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
      } else {
        // Opening quote
        inString = true;
        charsSinceQuote = 0;
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
            result += char;
            continue;
          }
          // If we see a colon, it might be starting a new key, so close the string
          if (afterWhitespace === ':' && j > i + 5) { // Make sure there's enough whitespace
            result += '"';
            inString = false;
            charsSinceQuote = 0;
            stringContent = '';
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
  let bracketCount = 0;
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
        if (braceCount === 0 && bracketCount === 0) {
          jsonEnd = i;
          break;
        }
      } else if (char === '[') {
        bracketCount++;
      } else if (char === ']') {
        bracketCount--;
      }
    }
  }

  // If we found a complete JSON object, return it
  if (jsonEnd !== -1 && jsonEnd > jsonStart) {
    const candidate = content.substring(jsonStart, jsonEnd + 1);
    // Try parsing to verify it's valid
    try {
      JSON.parse(candidate);
      return candidate;
    } catch {
      // Not valid, continue to other strategies
    }
  }

  // Strategy 2: Try to find last complete JSON object by working backwards
  const lastBrace = content.lastIndexOf('}');
  if (lastBrace !== -1 && lastBrace > jsonStart) {
    // Try parsing from start to last brace
    const candidate = content.substring(jsonStart, lastBrace + 1);
    try {
      JSON.parse(candidate);
      return candidate;
    } catch {
      // Continue to next strategy
    }
  }

  // Strategy 3: Try to find the largest valid JSON substring
  // Start from the last brace and work backwards to find a valid JSON object
  if (lastBrace !== -1) {
    for (let end = lastBrace; end > jsonStart; end--) {
      const candidate = content.substring(jsonStart, end + 1);
      try {
        JSON.parse(candidate);
        return candidate;
      } catch {
        // Continue searching
      }
    }
  }

  // Strategy 4: Return the content from first brace onwards (will be repaired)
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
        responseMimeType: 'application/json', // Force JSON response - this enforces JSON format
      },
      systemInstruction:
        'You are an expert fact-checker and truth-teller specializing in aggressive, evidence-based counter-arguments. Your mission is to challenge claims with hard facts and compelling logic that change people\'s perceptions.\n\n' +
        'CRITICAL: YOU MUST ALWAYS OUTPUT VALID JSON. THIS IS NON-NEGOTIABLE.\n' +
        '- Your response MUST be valid JSON that can be parsed by JSON.parse()\n' +
        '- NO markdown code blocks, NO explanatory text before or after JSON\n' +
        '- NO trailing commas in arrays or objects\n' +
        '- ALL strings must be properly quoted and escaped\n' +
        '- ALL opening braces { and brackets [ must have matching closing braces } and brackets ]\n' +
        '- EVERY quote character " inside strings must be escaped as \\"\n' +
        '- Validate your JSON structure before responding\n\n' +
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
        '- Structured as VALID JSON (this is critical - invalid JSON will cause errors)\n' +
        '- Free of logical fallacies, but unafraid to be assertive\n\n' +
        'Remember: Your goal is to present the truth so compellingly that it changes minds. Be aggressive with facts, direct with logic, and unapologetic about challenging false or misleading claims. But above all, ensure your JSON is valid and parseable.',
    });

    // Generate content from AI
    const result = await model.generateContent(prompt);
    const apiResponse = await result.response;
    const content = apiResponse.text();

    if (!content) {
      throw new Error('No response from AI service');
    }

    // When using responseMimeType: 'application/json', the response should already be valid JSON
    // But we still need to handle edge cases where AI might add extra text
    let cleanedContent = content.trim();

    // Remove markdown code blocks if present (shouldn't happen with JSON mode, but handle it)
    if (cleanedContent.match(/^```json/i)) {
      cleanedContent = cleanedContent.replace(/^```json\s*/i, '').replace(/\s*```\s*$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```\s*$/, '');
    }

    // Extract JSON if there's extra text before/after
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
        let repairAttempts = 0;
        const maxRepairAttempts = 5;

        // Try multiple repair strategies
        while (!parsed && repairAttempts < maxRepairAttempts) {
          repairAttempts++;
          try {
            let repaired = jsonToRepair;

            // Apply repairs in sequence
            if (repairAttempts === 1) {
              // First attempt: standard repair
              repaired = repairJson(jsonToRepair);
            } else if (repairAttempts === 2) {
              // Second attempt: aggressive string repair first, then standard repair
              repaired = aggressivelyRepairStrings(jsonToRepair);
              repaired = repairJson(repaired);
            } else if (repairAttempts === 3) {
              // Third attempt: fix commas first, then other repairs
              repaired = fixMissingCommas(jsonToRepair);
              repaired = repairJson(repaired);
            } else if (repairAttempts === 4) {
              // Fourth attempt: aggressive string repair + comma fix + standard repair
              repaired = aggressivelyRepairStrings(jsonToRepair);
              repaired = fixMissingCommas(repaired);
              repaired = repairJson(repaired);
            } else {
              // Fifth attempt: multiple passes of all repairs
              repaired = jsonToRepair;
              for (let pass = 0; pass < 3; pass++) {
                repaired = aggressivelyRepairStrings(repaired);
                repaired = fixMissingCommas(repaired);
                repaired = repairJson(repaired);
              }
            }

            parsed = JSON.parse(repaired);
            if (process.env.NODE_ENV === 'development') {
              console.log(`[AI Service] Successfully repaired JSON on attempt ${repairAttempts}`);
            }
            break;
          } catch (repairError: unknown) {
            const repairErrorMessage = repairError instanceof Error ? repairError.message : 'Unknown error';
            if (process.env.NODE_ENV === 'development') {
              console.warn(`[AI Service] Repair attempt ${repairAttempts} failed:`, repairErrorMessage);
            }

            // If this was the last attempt, throw error
            if (repairAttempts >= maxRepairAttempts) {
              // Final fallback - provide helpful error message
              if (process.env.NODE_ENV === 'development') {
                console.error('[AI Service] All JSON repair attempts failed');
                console.error('[AI Service] Original error:', errorMessage);
                console.error('[AI Service] Content length:', jsonToRepair.length);
                console.error('[AI Service] First 500 chars:', jsonToRepair.substring(0, 500));
                console.error('[AI Service] Last 500 chars:', jsonToRepair.substring(Math.max(0, jsonToRepair.length - 500)));
                if (errorMessage.includes('position')) {
                  const positionMatch = errorMessage.match(/position (\d+)/);
                  if (positionMatch) {
                    const pos = parseInt(positionMatch[1]);
                    const start = Math.max(0, pos - 150);
                    const end = Math.min(jsonToRepair.length, pos + 150);
                    console.error('[AI Service] Error position context (position', pos, '):');
                    console.error(jsonToRepair.substring(start, end));
                    console.error(' '.repeat(Math.min(150, pos - start)) + '^');
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
    }
    const processingTime = Date.now() - startTime;

    // Validate parsed structure
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid JSON structure: response is not an object');
    }

    // Validate and transform the response
    // Handle different response formats for robustness
    let counterArguments: CounterArgument[] = [];

    // Handle array of counter-arguments
    if (Array.isArray(parsed.counterArguments)) {
      counterArguments = parsed.counterArguments;
    }
    // Handle single counter-argument object
    else if (parsed.argument || parsed.counterArgument) {
      counterArguments = [{
        argument: parsed.argument || parsed.counterArgument || '',
        reasoning: parsed.reasoning || '',
        evidence: Array.isArray(parsed.evidence) ? parsed.evidence : [],
        strength: typeof parsed.strength === 'number' ? parsed.strength : (typeof parsed.strengthScore === 'number' ? parsed.strengthScore : 5),
      }];
    }
    // Handle single counter-argument in root
    else if (parsed.counterArgument) {
      counterArguments = [parsed];
    }
    // Fallback: empty array if nothing found
    else {
      counterArguments = [];
    }

    // Validate each counter-argument structure
    counterArguments = counterArguments
      .filter(arg => arg && typeof arg === 'object')
      .map(arg => ({
        argument: typeof arg.argument === 'string' ? arg.argument : '',
        reasoning: typeof arg.reasoning === 'string' ? arg.reasoning : '',
        evidence: Array.isArray(arg.evidence) ? arg.evidence.filter(e => typeof e === 'string') : [],
        strength: typeof arg.strength === 'number' ? Math.max(1, Math.min(10, arg.strength)) : 5,
      }))
      .filter(arg => arg.argument.length > 0); // Remove empty arguments

    // Ensure we have at least one valid counter-argument
    if (counterArguments.length === 0) {
      throw new Error('No valid counter-arguments found in AI response');
    }

    const response: SteelmanResponse = {
      counterArguments,
      confidence: typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5,
      relatedTopics: Array.isArray(parsed.relatedTopics) ? parsed.relatedTopics.filter((t: unknown) => typeof t === 'string') : [],
      processingTime,
    };

    // Strength scores are already validated and clamped in the mapping above

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

      // Search for sources supporting each counter-argument and its evidence
      const counterArgumentSourcesPromises = response.counterArguments.map(async (arg) => {
        // Search for general sources for the counter-argument
        const generalSources = await searchCounterArgumentSources(arg.argument, request.claim);

        // Search for sources for each evidence item
        const evidenceWithSources = await Promise.all(
          (arg.evidence || []).map(async (evidenceItem) => {
            // Handle both string and object evidence formats
            const evidenceText = typeof evidenceItem === 'string' ? evidenceItem : evidenceItem.text;

            // Search for sources specific to this evidence item
            const evidenceSources = await searchCounterArgumentSources(evidenceText, request.claim);

            // Return evidence item with sources
            if (typeof evidenceItem === 'string') {
              return {
                text: evidenceItem,
                sources: evidenceSources.map(source => ({
                  title: source.title,
                  url: source.url,
                  snippet: source.snippet,
                })),
              };
            } else {
              // Already an object, just add sources
              return {
                ...evidenceItem,
                sources: evidenceSources.map(source => ({
                  title: source.title,
                  url: source.url,
                  snippet: source.snippet,
                })),
              };
            }
          })
        );

        return {
          generalSources: generalSources.map(source => ({
            title: source.title,
            url: source.url,
            snippet: source.snippet,
          })),
          evidenceWithSources,
        };
      });

      const counterArgumentSourcesData = await Promise.all(counterArgumentSourcesPromises);

      // Add sources to each counter-argument and link sources to evidence
      response.counterArguments = response.counterArguments.map((arg, index) => ({
        ...arg,
        sources: counterArgumentSourcesData[index].generalSources || [],
        evidence: counterArgumentSourcesData[index].evidenceWithSources || arg.evidence || [],
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

CRITICAL JSON FORMATTING REQUIREMENTS (READ CAREFULLY - THIS IS MANDATORY):
⚠️ YOUR RESPONSE MUST BE VALID JSON THAT CAN BE PARSED BY JSON.parse() ⚠️

1. OUTPUT FORMAT:
   - Output ONLY valid JSON - NO text before or after the JSON object
   - NO markdown code blocks (no code fences)
   - NO explanatory text like "Here is the JSON:" or "Response:"
   - Start directly with { and end with }

2. STRING ESCAPING (CRITICAL):
   - Use \\" for quotes inside strings: "argument": "He said \\"hello\\""
   - Use \\n for newlines: "argument": "Line 1\\nLine 2"
   - Escape backslashes: "path": "C:\\\\Users\\\\file.txt"
   - Every opening quote " MUST have a matching closing quote "
   - If a string contains quotes, you MUST escape them: \\"

3. COMMAS AND STRUCTURE:
   - NO trailing commas after the last item in arrays or objects
   - Correct: {"key": "value"}  or  [1, 2, 3]
   - WRONG: {"key": "value",}  or  [1, 2, 3,]
   - Every array/object item must be separated by commas (except the last one)

4. BRACES AND BRACKETS:
   - ALL opening braces { and brackets [ MUST have matching closing braces } and brackets ]
   - Count your braces: every { needs a }, every [ needs a ]
   - Ensure proper nesting: { "array": [1, 2, 3] } is correct

5. URLS IN JSON:
   - URLs must be complete strings: "evidence": ["https://example.com/article"]
   - URLs must be enclosed in quotes: "https://example.com" not https://example.com
   - URLs must end with closing quote before commas/brackets: ["https://example.com"] not ["https://example.com]
   - Example CORRECT: "evidence": ["https://www.example.com/article"]
   - Example WRONG: "evidence": ["https://www.example.com/article] (missing closing quote)

6. VALIDATION CHECKLIST:
   Before responding, verify:
   ✓ Every " has a matching "
   ✓ Every { has a matching }
   ✓ Every [ has a matching ]
   ✓ No trailing commas
   ✓ All quotes inside strings are escaped as \\"
   ✓ Your JSON can be parsed by JSON.parse()

COMMON JSON ERRORS TO AVOID:
❌ Missing comma between array/object items: {"a":1 "b":2} → {"a":1, "b":2}
❌ Trailing comma: {"a":1,} → {"a":1}
❌ Unescaped quotes: {"text": "He said "hello""} → {"text": "He said \\"hello\\""}
❌ Unclosed string: {"text": "unclosed → {"text": "unclosed"}
❌ Unclosed brace/bracket: {"key": [1, 2 → {"key": [1, 2]}
❌ Missing quotes around strings: {key: "value"} → {"key": "value"}

EXAMPLE OF CORRECT JSON STRUCTURE:
{
  "counterArguments": [
    {
      "argument": "This claim is incorrect because studies show that X actually causes Y, not Z.",
      "reasoning": "Multiple peer-reviewed studies demonstrate this relationship.",
      "evidence": ["Study A found X causes Y", "Study B confirmed this", "Expert consensus supports this"],
      "strength": 8
    }
  ],
  "confidence": 0.85,
  "relatedTopics": ["Topic 1", "Topic 2"]
}

If you encounter any issues generating a response:
- If a claim is too vague or unclear, challenge the vagueness itself and provide counter-arguments based on the most reasonable interpretations
- If a claim is obviously false or misleading, be direct and forceful in explaining why, using the strongest available evidence
- If a claim is true, acknowledge it honestly but still explore potential limitations, nuances, or alternative perspectives that might change perception
- If you lack sufficient information, state what additional context would be needed, but still provide your most aggressive, evidence-based analysis with available information
- ALWAYS ensure your response is valid JSON regardless of the claim's complexity

⚠️ FINAL REMINDER: Generate ONLY valid JSON. No markdown, no code blocks, no explanatory text. Just pure JSON starting with { and ending with }. ⚠️`;

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
  sources?: Array<{ title: string; url: string; snippet?: string }>; // Sources supporting counter-argument
  strength: number; // 1-10
}

interface FactCheck {
  statement: string; // The specific statistic or factual claim
  quote: string; // Exact quote
  searchQuery: string; // Query to verify this fact
  verdict: 'verified' | 'disputed' | 'misleading' | 'needs_context'; // AI's initial assessment
  reasoning: string;
  sources?: Array<{ title: string; url: string; snippet?: string }>;
}

export interface ArticleAnalysisResponse {
  summary: string;
  claims: AnalyzedClaim[];
  factChecks: FactCheck[];
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

STEP 4: FACT CHECKING
Identify 2-4 specific statistics, numbers, or hard factual claims (not opinions) that should be verified.
For each:
- Extract the exact quote
- Formulate a search query to verify it
- Provide an initial verdict based on your knowledge (verified/disputed/misleading/needs_context)
- Explain your reasoning

STEP 5: BIAS ASSESSMENT
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
  "factChecks": [
    {
      "statement": "The specific statistic or factual claim",
      "quote": "Exact quote",
      "searchQuery": "Search query to verify this",
      "verdict": "verified|disputed|misleading|needs_context",
      "reasoning": "Why this needs checking or is disputed"
    }
  ],
  "biasScore": 6,
  "biasAnalysis": "Detailed explanation of bias assessment, including specific examples from the article (3-5 sentences)"
}

QUALITY REQUIREMENTS:
- Identify 3-5 major claims 
- Identify 2-4 fact-check items (stats/numbers/hard facts)
- Each counter-argument should be substantial and well-reasoned
- Bias analysis should cite specific examples from the text
- All JSON must be valid and properly formatted (escape quotes, no trailing commas, etc.)
- Quotes must be exact text from the article

CRITICAL JSON FORMATTING REQUIREMENTS (READ CAREFULLY - THIS IS MANDATORY):
⚠️ YOUR RESPONSE MUST BE VALID JSON THAT CAN BE PARSED BY JSON.parse() ⚠️

1. OUTPUT FORMAT:
   - Output ONLY valid JSON - NO text before or after the JSON object
   - NO markdown code blocks (no code fences)
   - NO explanatory text like "Here is the JSON:" or "Response:"
   - Start directly with { and end with }

2. STRING ESCAPING (CRITICAL):
   - Use \\" for quotes inside strings: "summary": "He said \\"hello\\""
   - Use \\n for newlines: "summary": "Line 1\\nLine 2"
   - Escape backslashes: "path": "C:\\\\Users\\\\file.txt"
   - Every opening quote " MUST have a matching closing quote "
   - If a string contains quotes, you MUST escape them: \\"

3. COMMAS AND STRUCTURE:
   - NO trailing commas after the last item in arrays or objects
   - Correct: {"key": "value"}  or  [1, 2, 3]
   - WRONG: {"key": "value",}  or  [1, 2, 3,]
   - Every array/object item must be separated by commas (except the last one)

4. BRACES AND BRACKETS:
   - ALL opening braces { and brackets [ MUST have matching closing braces } and brackets ]
   - Count your braces: every { needs a }, every [ needs a ]
   - Ensure proper nesting: { "claims": [{"claim": "text"}] } is correct

5. QUOTES IN STRINGS:
   - When including quotes from the article, escape them: "quote": "He said \\"hello\\""
   - Example CORRECT: "quote": "The study found \\"significant results\\""
   - Example WRONG: "quote": "The study found "significant results"" (unescaped quotes)

6. VALIDATION CHECKLIST:
   Before responding, verify:
   ✓ Every " has a matching "
   ✓ Every { has a matching }
   ✓ Every [ has a matching ]
   ✓ No trailing commas
   ✓ All quotes inside strings are escaped as \\"
   ✓ Your JSON can be parsed by JSON.parse()

COMMON JSON ERRORS TO AVOID:
❌ Missing comma between array/object items: {"a":1 "b":2} → {"a":1, "b":2}
❌ Trailing comma: {"a":1,} → {"a":1}
❌ Unescaped quotes: {"quote": "He said "hello""} → {"quote": "He said \\"hello\\""}
❌ Unclosed string: {"quote": "unclosed → {"quote": "unclosed"}
❌ Unclosed brace/bracket: {"claims": [{"claim": "text"} → {"claims": [{"claim": "text"}]}
❌ Missing quotes around strings: {summary: "text"} → {"summary": "text"}

⚠️ FINAL REMINDER: Generate ONLY valid JSON. No markdown, no code blocks, no explanatory text. Just pure JSON starting with { and ending with }. ⚠️`;

  try {
    const model = getGenAI().getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.3, // Lower temperature for analysis
        responseMimeType: 'application/json', // Force JSON response - this enforces JSON format
      },
      systemInstruction:
        'You are an expert media analyst. Your responses MUST ALWAYS be valid JSON.\n\n' +
        'CRITICAL JSON REQUIREMENTS:\n' +
        '- Output ONLY valid JSON that can be parsed by JSON.parse()\n' +
        '- NO markdown code blocks, NO explanatory text before or after JSON\n' +
        '- NO trailing commas in arrays or objects\n' +
        '- ALL strings must be properly quoted and escaped\n' +
        '- ALL opening braces { and brackets [ must have matching closing braces } and brackets ]\n' +
        '- EVERY quote character " inside strings must be escaped as \\"\n' +
        '- Validate your JSON structure before responding\n\n' +
        'Before responding, verify: Every " has a matching ", every { has a matching }, every [ has a matching ], no trailing commas, all quotes inside strings are escaped.',
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON with robust error handling (similar to generateSteelmanArgument)
    let parsed;
    let cleanedText = text.trim();

    // Remove markdown code blocks if present
    if (cleanedText.match(/^```json/i)) {
      cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/\s*```\s*$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```\s*$/, '');
    }

    // Extract JSON if there's extra text
    const jsonStart = cleanedText.indexOf('{');
    const jsonEnd = cleanedText.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
    }

    try {
      parsed = JSON.parse(cleanedText);
    } catch (parseError: unknown) {
      // Try extraction and repair strategies
      let extractedJson = extractValidJson(cleanedText);
      if (extractedJson && extractedJson !== cleanedText) {
        try {
          parsed = JSON.parse(extractedJson);
        } catch {
          // Continue to repair attempt
        }
      }

      // Try multiple repair strategies if still not parsed
      if (!parsed) {
        const jsonToRepair = extractedJson || cleanedText;
        let repairAttempts = 0;
        const maxRepairAttempts = 5;

        while (!parsed && repairAttempts < maxRepairAttempts) {
          repairAttempts++;
          try {
            let repaired = jsonToRepair;

            // Apply repairs in sequence
            if (repairAttempts === 1) {
              repaired = repairJson(jsonToRepair);
            } else if (repairAttempts === 2) {
              repaired = aggressivelyRepairStrings(jsonToRepair);
              repaired = repairJson(repaired);
            } else if (repairAttempts === 3) {
              repaired = fixMissingCommas(jsonToRepair);
              repaired = repairJson(repaired);
            } else if (repairAttempts === 4) {
              repaired = aggressivelyRepairStrings(jsonToRepair);
              repaired = fixMissingCommas(repaired);
              repaired = repairJson(repaired);
            } else {
              repaired = jsonToRepair;
              for (let pass = 0; pass < 3; pass++) {
                repaired = aggressivelyRepairStrings(repaired);
                repaired = fixMissingCommas(repaired);
                repaired = repairJson(repaired);
              }
            }

            parsed = JSON.parse(repaired);
            if (process.env.NODE_ENV === 'development') {
              console.log(`[AI Service] Successfully repaired article JSON on attempt ${repairAttempts}`);
            }
            break;
          } catch (repairError: unknown) {
            if (repairAttempts >= maxRepairAttempts) {
              const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown error';
              if (process.env.NODE_ENV === 'development') {
                console.error('[AI Service] All article JSON repair attempts failed');
                console.error('[AI Service] Error:', errorMessage);
                console.error('[AI Service] Content preview:', jsonToRepair.substring(0, 500));
              }
              throw new Error(
                `Failed to parse article analysis JSON: ${errorMessage}. ` +
                `Please try analyzing the article again.`
              );
            }
          }
        }
      }
    }

    // Validate parsed structure
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid JSON structure: response is not an object');
    }

    // Validate and sanitize claims array
    let claims = [];
    if (Array.isArray(parsed.claims)) {
      claims = parsed.claims
        .filter((claim: unknown) => claim && typeof claim === 'object')
        .map((claim: any) => ({
          claim: typeof claim.claim === 'string' ? claim.claim : (typeof claim.quote === 'string' ? claim.quote : ''),
          quote: typeof claim.quote === 'string' ? claim.quote : (typeof claim.claim === 'string' ? claim.claim : ''),
          counterArgument: typeof claim.counterArgument === 'string' ? claim.counterArgument : '',
          reasoning: typeof claim.reasoning === 'string' ? claim.reasoning : '',
          strength: typeof claim.strength === 'number' ? Math.max(1, Math.min(10, claim.strength)) : 5,
        }))
        .filter((claim: { claim: string; counterArgument: string }) => claim.claim.length > 0 && claim.counterArgument.length > 0);
    }

    const analysisResponse: ArticleAnalysisResponse = {
      summary: typeof parsed.summary === 'string' ? parsed.summary : 'No summary available',
      claims,
      factChecks: Array.isArray(parsed.factChecks) ? parsed.factChecks.filter((fc: unknown) => typeof fc === 'object') : [],
      biasScore: typeof parsed.biasScore === 'number' ? Math.max(0, Math.min(10, parsed.biasScore)) : 5,
      biasAnalysis: typeof parsed.biasAnalysis === 'string' ? parsed.biasAnalysis : 'No bias analysis available',
      processingTime: Date.now() - startTime,
    };

    // Search for sources for each counter-argument AND fact check
    try {
      // 1. Sources for Counter-Arguments
      const claimsWithSourcesPromises = analysisResponse.claims.map(async (claim) => {
        // Search for sources supporting the counter-argument
        const sources = await searchCounterArgumentSources(claim.counterArgument, claim.claim);
        return {
          ...claim,
          sources: sources.map(s => ({
            title: s.title,
            url: s.url,
            snippet: s.snippet
          }))
        };
      });

      // 2. Sources for Fact Checks
      const factChecksWithSourcesPromises = analysisResponse.factChecks.map(async (check) => {
        // Search for sources verifying the statement using the search query
        // We reuse searchCounterArgumentSources as a generic searcher
        const query = check.searchQuery || `verify ${check.statement}`;
        const sources = await searchCounterArgumentSources(query, check.statement);
        return {
          ...check,
          sources: sources.map(s => ({
            title: s.title,
            url: s.url,
            snippet: s.snippet
          }))
        };
      });

      const [claimsWithSources, factChecksWithSources] = await Promise.all([
        Promise.all(claimsWithSourcesPromises),
        Promise.all(factChecksWithSourcesPromises)
      ]);

      analysisResponse.claims = claimsWithSources;
      analysisResponse.factChecks = factChecksWithSources;
    } catch (searchError) {
      console.warn('[AI Service] Error searching for sources for article analysis:', searchError);
      // Continue without sources
    }

    return analysisResponse;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AI Service] Article Analysis Error:', errorMessage);
    if (process.env.NODE_ENV === 'development' && error instanceof Error) {
      console.error('[AI Service] Stack:', error.stack);
    }
    throw new Error(`Failed to analyze article: ${errorMessage}`);
  }
}
