/**
 * Quick API Key Verification
 * Run: node verify-key.js
 */

require('dotenv').config();

const key = process.env.OPENROUTER_API_KEY;

console.log('\n=== API Key Verification ===\n');

if (!key) {
  console.error('❌ ERROR: OPENROUTER_API_KEY not found in .env');
  process.exit(1);
}

const trimmed = key.trim();
console.log('✅ Key found in .env');
console.log(`   Length: ${trimmed.length} characters`);
console.log(`   Starts with: ${trimmed.substring(0, 15)}`);
console.log(`   Ends with: ...${trimmed.substring(trimmed.length - 10)}`);

if (trimmed.startsWith('Sk-or-v1-')) {
  console.log('✅ Key format is correct (Sk-or-v1-...)');
} else if (trimmed.startsWith('sk-or-')) {
  console.log('✅ Key format is correct (sk-or-...)');
} else {
  console.error('❌ Key format is incorrect!');
  console.error('   Expected: Sk-or-v1-... or sk-or-...');
  process.exit(1);
}

// Check for whitespace issues
if (key !== trimmed) {
  console.warn('⚠️  WARNING: Key has leading/trailing whitespace');
  console.warn('   This has been trimmed automatically');
}

// Expected key from user
const expectedSuffix = 'e1bc52f5bdffc6ba167ec870ba0f9b752d56d04c8f53d1f952970872f59e1cd0';
if (trimmed.endsWith(expectedSuffix)) {
  console.log('✅ Key matches expected value');
} else {
  console.warn('⚠️  Key suffix does not match expected value');
}

console.log('\n✅ API key format is valid!');
console.log('\n📝 Next steps:');
console.log('   1. Make sure backend server is restarted');
console.log('   2. Run: node test-openrouter.js');
console.log('   3. Check backend logs when submitting a claim\n');
