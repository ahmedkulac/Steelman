/**
 * Test OpenRouter API Key
 * 
 * Run this to verify your API key works:
 * node test-openrouter.js
 */

require('dotenv').config();

const axios = require('axios');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const apiKey = process.env.OPENROUTER_API_KEY?.trim();

console.log('\n=== OpenRouter API Key Test ===\n');

if (!apiKey) {
  console.error('❌ ERROR: OPENROUTER_API_KEY is not set in .env file');
  process.exit(1);
}

console.log(`✅ API Key found: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
console.log(`   Length: ${apiKey.length} characters`);
console.log(`   Starts with: ${apiKey.substring(0, 10)}`);

if (!apiKey.startsWith('Sk-or-v1-') && !apiKey.startsWith('sk-or-')) {
  console.warn('⚠️  WARNING: API key format may be incorrect');
  console.warn('   Expected format: Sk-or-v1-... or sk-or-...');
}

console.log('\n📡 Testing API call...\n');

const headers = {
  'Authorization': `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
  'HTTP-Referer': 'http://localhost:3000',
  'X-Title': 'Steelman Test',
};

const payload = {
  model: 'google/gemini-2.0-flash-001',
  messages: [
    { role: 'user', content: 'Say "Hello, this is a test" in one sentence.' }
  ],
  temperature: 0.7,
};

axios.post(OPENROUTER_API_URL, payload, { headers })
  .then(response => {
    console.log('✅ SUCCESS! API key is valid.\n');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ FAILED! API key test failed.\n');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Status Text: ${error.response.statusText}`);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 401) {
        console.error('\n💡 This means your API key is invalid or expired.');
        console.error('   Please check:');
        console.error('   1. Go to https://openrouter.ai/keys');
        console.error('   2. Verify your key is active');
        console.error('   3. Create a new key if needed');
        console.error('   4. Update backend/.env with the new key');
      }
    } else {
      console.error('Error:', error.message);
    }
    
    process.exit(1);
  });
