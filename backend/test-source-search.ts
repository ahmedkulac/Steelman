
import { searchSources } from './src/utils/searchSources';
import 'dotenv/config';

async function testSearch() {
    console.log('Testing source search utility...');
    try {
        const query = "earth is flat evidence sources";
        const results = await searchSources(query, 5);

        console.log(`\nFound ${results.length} results for "${query}"`);
        results.forEach((r, i) => {
            console.log(`\n[${i + 1}] ${r.title}`);
            console.log(`    URL: ${r.url}`);
            console.log(`    Snippet: ${r.snippet.substring(0, 50)}...`);
        });

        if (results.length === 0) {
            console.log("\nWARNING: No results found. Both library search and fallback failed.");
        } else {
            console.log("\nSUCCESS: Sources found.");
        }
    } catch (error: any) {
        console.error('\nTest Failed:', error.message);
    }
}

testSearch();
