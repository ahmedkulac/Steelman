/**
 * AI Service - OpenRouter Integration
 * 
 * Handles all AI-related operations for generating steelman counter-arguments.
 * Uses OpenRouter API to analyze claims and generate the strongest possible 
 * opposing viewpoints using various LLMs (defaulting to Gemini 2.0 Flash).
 */

import axios from 'axios';
import { createHash } from 'crypto';
import { searchClaimSources, searchCounterArgumentSources } from '../utils/searchSources';

// OpenRouter Configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';
const SITE_NAME = process.env.SITE_NAME || 'Steelman';

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
 */
export function generateCacheKey(claim: string): string {
  // Normalize: lowercase, trim, remove extra spaces
  const normalized = claim.toLowerCase().trim().replace(/\s+/g, ' ');
  return createHash('sha256').update(normalized).digest('hex');
}

/**
 * Helper to make OpenRouter API calls
 */
async function callOpenRouter(messages: any[], temperature: number = 0.7, jsonMode: boolean = true) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  // Validate API key format
  if (!apiKey.startsWith('Sk-or-v1-') && !apiKey.startsWith('sk-or-')) {
    console.warn('[AI Service] Warning: API key format may be incorrect. Expected format: Sk-or-v1-... or sk-or-...');
  }

  const model = process.env.AI_MODEL || 'google/gemini-2.0-flash-001';

  // Debug: Log API key info (first 10 and last 4 chars only for security)
  const keyPreview = apiKey.length > 14 
    ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`
    : '***';
  console.log(`[AI Service] Using API key: ${keyPreview}`);
  console.log(`[AI Service] Key length: ${apiKey.length}`);
  console.log(`[AI Service] Model: ${model}`);

  // Prepare headers - ensure Authorization header is exactly correct
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiKey}`, // Must be exactly "Bearer <key>" with space
    'Content-Type': 'application/json',
  };

  // Add optional headers if configured (these help with OpenRouter analytics)
  if (SITE_URL) {
    headers['HTTP-Referer'] = SITE_URL;
  }
  if (SITE_NAME) {
    headers['X-Title'] = SITE_NAME;
  }

  // Verify Authorization header format
  if (!headers['Authorization'].startsWith('Bearer ')) {
    throw new Error('Authorization header format is incorrect. Must start with "Bearer "');
  }
  
  // Verify API key is not empty after "Bearer "
  const keyAfterBearer = headers['Authorization'].substring(7).trim();
  if (!keyAfterBearer || keyAfterBearer.length < 10) {
    throw new Error('API key appears to be empty or too short after "Bearer " prefix');
  }

  // Debug: Log headers (without exposing full API key)
  console.log(`[AI Service] Request headers:`, {
    ...headers,
    'Authorization': `Bearer ${keyPreview}`,
  });

  // Prepare request body
  const requestBody: any = {
    model,
    messages,
    temperature,
  };

  // Only add response_format if jsonMode is true and model supports it
  // Some models don't support this parameter, which can cause 401 errors
  if (jsonMode) {
    // Gemini models via OpenRouter may not support response_format
    // We rely on prompt instructions instead
    // Uncomment below if your model explicitly supports it:
    // requestBody.response_format = { type: "json_object" };
  }

  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      requestBody,
      {
        headers,
      }
    );

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error('[AI Service] OpenRouter API Error:', error.message);
    if (error.response) {
      // Log status and full error data for debugging
      console.error(`[AI Service] Status: ${error.response.status}`);
      console.error(`[AI Service] Status Text: ${error.response.statusText}`);
      const dataStr = JSON.stringify(error.response.data, null, 2);
      console.error(`[AI Service] Response Data:`, dataStr);
      
      // Provide more helpful error messages
      if (error.response.status === 401) {
        const errorMsg = error.response.data?.error?.message || error.response.data?.message || 'Invalid API key';
        throw new Error(`OpenRouter API authentication failed (401): ${errorMsg}. Please check your OPENROUTER_API_KEY in .env file.`);
      }
    }
    
    // Log request details for debugging (without exposing full API key)
    if (apiKey) {
      const keyPreview = apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4);
      console.error(`[AI Service] API Key Preview: ${keyPreview}`);
    }
    console.error(`[AI Service] Model: ${model}`);
    console.error(`[AI Service] URL: ${OPENROUTER_API_URL}`);
    
    throw new Error(`OpenRouter API call failed: ${error.message}`);
  }
}

/**
 * Fix missing commas in arrays and objects using multiple strategies
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
        if ((char === '"' || char === '{' || char === '[' || /\d/.test(char) || char === 't' || char === 'f' || char === 'n') && i > 0) {
          let j = i - 1;
          while (j >= 0 && /\s/.test(repaired[j])) j--;

          if (j >= 0) {
            const prevChar = repaired[j];
            if ((prevChar === '"' || prevChar === '}' || prevChar === ']' || /\d/.test(prevChar)) &&
              repaired.substring(Math.max(0, j - 4), j + 1).match(/(true|false|null)$/) === null) {
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
 */
function repairJson(jsonString: string): string {
  let repaired = jsonString;

  // Remove trailing commas before closing braces/brackets
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1');

  // Fix missing commas first
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
      if (char === '\n') { result += '\\n'; continue; }
      if (char === '\r') { continue; }
      if (char === '\t') { result += '\\t'; continue; }
    }

    result += char;
  }

  if (inString) {
    result += '"';
  }

  repaired = result;

  // Count braces to check balance
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
  return /^https?:\/\//i.test(str.trim());
}

/**
 * Aggressively repair unterminated strings
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
        inString = false;
        charsSinceQuote = 0;
        stringContent = '';
      } else {
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

      // Close strings on newlines
      if (char === '\n' || char === '\r') {
        result += '"';
        inString = false;
        charsSinceQuote = 0;
        stringContent = '';
        continue;
      }

      // Special handling for URLs
      if (looksLikeUrl(stringContent)) {
        if (/\s/.test(char)) {
          let j = i + 1;
          while (j < jsonString.length && /\s/.test(jsonString[j])) j++;

          if (j < jsonString.length) {
            const afterWhitespace = jsonString[j];
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
      }

      // Close really long non-URL strings if we see structural chars
      if (charsSinceQuote > 10 && /\s/.test(char) && !looksLikeUrl(stringContent)) {
        let j = i + 1;
        while (j < jsonString.length && /\s/.test(jsonString[j])) j++;

        if (j < jsonString.length) {
          const afterWhitespace = jsonString[j];
          if (afterWhitespace === ',' || afterWhitespace === '}' || afterWhitespace === ']') {
            result += '"';
            inString = false;
            charsSinceQuote = 0;
            stringContent = '';
            result += char;
            continue;
          }
          if (afterWhitespace === ':' && j > i + 5) {
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

  if (inString) {
    result += '"';
  }

  return result;
}

/**
 * Extract valid JSON from potentially malformed response
 */
function extractValidJson(content: string): string | null {
  const jsonStart = content.indexOf('{');
  if (jsonStart === -1) return null;

  // Strategy 1: Find matching closing brace
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

  if (jsonEnd !== -1 && jsonEnd > jsonStart) {
    const candidate = content.substring(jsonStart, jsonEnd + 1);
    try {
      JSON.parse(candidate);
      return candidate;
    } catch {
      // Continue
    }
  }

  // Strategy 2: Last complete JSON object
  const lastBrace = content.lastIndexOf('}');
  if (lastBrace !== -1 && lastBrace > jsonStart) {
    const candidate = content.substring(jsonStart, lastBrace + 1);
    try {
      JSON.parse(candidate);
      return candidate;
    } catch {
      // Continue
    }
  }

  // Strategy 3: Largest valid JSON substring
  if (lastBrace !== -1) {
    for (let end = lastBrace; end > jsonStart; end--) {
      const candidate = content.substring(jsonStart, end + 1);
      try {
        JSON.parse(candidate);
        return candidate;
      } catch {
        // Continue
      }
    }
  }

  return content.substring(jsonStart);
}

/**
 * Generate steelman counter-arguments
 */
export async function generateSteelmanArgument(
  request: SteelmanRequest
): Promise<SteelmanResponse> {
  const startTime = Date.now();

  const { claim, category, context } = request;

  const systemPrompt = `You are an expert critical thinking assistant specializing in the steelman technique. Your task is to analyze a claim and construct the strongest possible opposing argument.
  
  AGGRESSIVE TRUTH-BASED COUNTER-ARGUMENT GUIDELINES:
  Your goal is to create powerful, evidence-driven counter-arguments that challenge the claim and change the reader's perception. Be direct, forceful, and uncompromising with the truth.
  
  1. Direct Confrontation: Challenge the claim head-on with facts.
  2. Evidence-First Approach: Lead with strong, damning evidence (specific data, studies, verifiable facts).
  3. Attack Core Premises: Dismantle fundamental assumptions.
  4. Truth Over Politeness: Prioritize factual accuracy and logical rigor.
  5. Perception Change Focus: Structure argument to shift understanding.
  
  TONE: Direct, assertive, evidence-backed. No hedging.
  
  RESPONSE FORMAT (CRITICAL):
  Respond with ONLY valid JSON. No markdown. No text before/after.
  {
    "counterArguments": [
      {
        "argument": "Direct, forceful, evidence-based counter-argument (4-6 sentences)",
        "reasoning": "Why this argument is compelling (3-5 sentences)",
        "evidence": ["Specific evidence 1", "Specific evidence 2"],
        "strength": 8
      }
    ],
    "confidence": 0.85,
    "relatedTopics": ["Topic 1", "Topic 2"]
  }`;

  const userPrompt = `CLAIM TO ANALYZE: "${claim}"
  ${category ? `CATEGORY: ${category}` : ''}
  ${context ? `ADDITIONAL CONTEXT: ${context}` : ''}
  
  Generate a Steelman response now.`;

  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const content = await callOpenRouter(messages, 0.75, true);

    if (!content) throw new Error('No content returned from AI');

    // Parse logic
    let parsed;
    let cleanedContent = content.trim();

    // Clean markdown
    if (cleanedContent.match(/^```json/i)) {
      cleanedContent = cleanedContent.replace(/^```json\s*/i, '').replace(/\s*```\s*$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```\s*$/, '');
    }

    try {
      parsed = JSON.parse(cleanedContent);
    } catch (parseError: unknown) {
      // Repair strategies
      let extractedJson = extractValidJson(cleanedContent);
      if (extractedJson && extractedJson !== cleanedContent) {
        try {
          parsed = JSON.parse(extractedJson);
        } catch { }
      }

      if (!parsed) {
        const jsonToRepair = extractedJson || cleanedContent;
        let repairAttempts = 0;
        const maxRepairAttempts = 3;

        while (!parsed && repairAttempts < maxRepairAttempts) {
          repairAttempts++;
          try {
            let repaired = jsonToRepair;
            if (repairAttempts === 1) repaired = repairJson(jsonToRepair);
            else if (repairAttempts === 2) {
              repaired = aggressivelyRepairStrings(jsonToRepair);
              repaired = repairJson(repaired);
            } else {
              repaired = aggressivelyRepairStrings(jsonToRepair);
              repaired = fixMissingCommas(repaired);
              repaired = repairJson(repaired);
            }
            parsed = JSON.parse(repaired);
          } catch (e) { }
        }
      }
    }

    if (!parsed) throw new Error('Failed to parse valid JSON response');

    // Validation
    let counterArguments: CounterArgument[] = [];
    if (Array.isArray(parsed.counterArguments)) {
      counterArguments = parsed.counterArguments;
    } else if (parsed.argument || parsed.counterArgument) {
      counterArguments = [{
        argument: parsed.argument || parsed.counterArgument || '',
        reasoning: parsed.reasoning || '',
        evidence: Array.isArray(parsed.evidence) ? parsed.evidence : [],
        strength: typeof parsed.strength === 'number' ? parsed.strength : 5,
      }];
    } else {
      counterArguments = [];
    }

    counterArguments = counterArguments
      .filter(arg => arg && typeof arg === 'object')
      .map(arg => ({
        argument: typeof arg.argument === 'string' ? arg.argument : '',
        reasoning: typeof arg.reasoning === 'string' ? arg.reasoning : '',
        evidence: Array.isArray(arg.evidence) ? arg.evidence.filter(e => typeof e === 'string') : [],
        strength: typeof arg.strength === 'number' ? Math.max(1, Math.min(10, arg.strength)) : 5,
      }))
      .filter(arg => arg.argument.length > 0);

    if (counterArguments.length === 0) {
      throw new Error('No valid counter-arguments found');
    }

    const response: SteelmanResponse = {
      counterArguments,
      confidence: typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5,
      relatedTopics: Array.isArray(parsed.relatedTopics) ? parsed.relatedTopics.filter((t: unknown) => typeof t === 'string') : [],
      processingTime: Date.now() - startTime,
    };

    // Sources Search
    try {
      const claimSources = await searchClaimSources(request.claim);
      if (claimSources.length > 0) {
        response.claimSources = claimSources.map(source => ({
          title: source.title,
          url: source.url,
          snippet: source.snippet,
        }));
      }

      const counterArgumentSourcesPromises = response.counterArguments.map(async (arg) => {
        const generalSources = await searchCounterArgumentSources(arg.argument, request.claim);
        const evidenceWithSources = await Promise.all(
          (arg.evidence || []).map(async (evidenceItem) => {
            const evidenceText = typeof evidenceItem === 'string' ? evidenceItem : evidenceItem.text;
            const evidenceSources = await searchCounterArgumentSources(evidenceText, request.claim);
            return typeof evidenceItem === 'string'
              ? { text: evidenceItem, sources: evidenceSources }
              : { ...evidenceItem, sources: evidenceSources };
          })
        );
        return { generalSources, evidenceWithSources };
      });

      const counterArgumentSourcesData = await Promise.all(counterArgumentSourcesPromises);

      response.counterArguments = response.counterArguments.map((arg, index) => ({
        ...arg,
        sources: counterArgumentSourcesData[index].generalSources || [],
        evidence: counterArgumentSourcesData[index].evidenceWithSources || arg.evidence || [],
      }));

    } catch (searchError) {
      console.warn('[AI Service] Error searching for sources:', searchError);
    }

    return response;

  } catch (error: any) {
    console.error('[AI Service] Error:', error.message);
    throw new Error(`Failed to generate steelman argument: ${error.message}`);
  }
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

  // Truncate content
  const contentToAnalyze = request.content.length > 50000
    ? request.content.substring(0, 50000) + '...[truncated]'
    : request.content;


  const systemPrompt = `You are an expert media analyst.
  
  ANALYSIS TASK:
  1. SUMMARY: Concise 2-3 sentence summary.
  2. CLAIM IDENTIFICATION: Identify 3-5 major controversial claims. Extract EXACT quote. 
  3. AGGRESSIVE COUNTER-ARGUMENTS: For each claim, generate a direct, evidence-based counter-argument.
  4. FACT CHECKING: Identify 2-4 specific statistics/facts to verify.
  5. BIAS ASSESSMENT: Evaluate bias (1-10).
  
  RESPONSE FORMAT (VALID JSON ONLY):
  {
    "summary": "...",
    "claims": [
      {
        "claim": "...",
        "quote": "...",
        "counterArgument": "...",
        "reasoning": "...",
        "strength": 8
      }
    ],
    "factChecks": [
      {
        "statement": "...",
        "quote": "...",
        "searchQuery": "...",
        "verdict": "verified|disputed|misleading|needs_context",
        "reasoning": "..."
      }
    ],
    "biasScore": 6,
    "biasAnalysis": "..."
  }`;

  const userPrompt = `ARTICLE TO ANALYZE:
  Title: "${request.title}"
  ${request.url ? `URL: ${request.url}` : ''}
  
  Content:
  ${contentToAnalyze}`;

  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const content = await callOpenRouter(messages, 0.3, true);

    if (!content) throw new Error('No content from AI');

    // Parse logic (same as above)
    let parsed;
    let cleanedContent = content.trim();

    if (cleanedContent.match(/^```json/i)) {
      cleanedContent = cleanedContent.replace(/^```json\s*/i, '').replace(/\s*```\s*$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```\s*$/, '');
    }

    try {
      parsed = JSON.parse(cleanedContent);
    } catch (e) {
      let extracted = extractValidJson(cleanedContent);
      if (extracted) {
        try { parsed = JSON.parse(extracted); } catch (e) { }
      }
      if (!parsed) {
        // Minimal repair
        try {
          let r = repairJson(extracted || cleanedContent);
          parsed = JSON.parse(r);
        } catch (e) { }
      }
    }

    if (!parsed) throw new Error('Failed to parse Article Analysis JSON');

    // Validate structure
    let claims = [];
    if (Array.isArray(parsed.claims)) {
      claims = parsed.claims
        .filter((c: any) => c && typeof c === 'object')
        .map((c: any) => ({
          claim: c.claim || c.quote || '',
          quote: c.quote || c.claim || '',
          counterArgument: c.counterArgument || '',
          reasoning: c.reasoning || '',
          strength: typeof c.strength === 'number' ? c.strength : 5
        }))
        .filter((c: any) => c.claim && c.counterArgument);
    }

    const analysisResponse: ArticleAnalysisResponse = {
      summary: parsed.summary || 'No summary',
      claims,
      factChecks: Array.isArray(parsed.factChecks) ? parsed.factChecks : [],
      biasScore: typeof parsed.biasScore === 'number' ? parsed.biasScore : 5,
      biasAnalysis: parsed.biasAnalysis || '',
      processingTime: Date.now() - startTime
    };

    // Sources Search
    try {
      const claimsWithSourcesPromises = analysisResponse.claims.map(async (claim) => {
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

      const factChecksWithSourcesPromises = analysisResponse.factChecks.map(async (check) => {
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
      analysisResponse.factChecks = factChecksWithSources; // Assign type-compatible array

    } catch (e) {
      console.warn('[AI Service] Source search failed:', e);
    }

    return analysisResponse;

  } catch (error: any) {
    console.error('[AI Service] Article Analysis Error:', error.message);
    throw new Error(`Failed to analyze article: ${error.message}`);
  }
}
