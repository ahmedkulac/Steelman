
import { search } from 'duck-duck-scrape';

async function testLib() {
    console.log('Testing duck-duck-scrape library...');
    try {
        const results = await search('flat earth evidence', { safeSearch: 0 }); // 0 = moderate

        console.log(`Found ${results.results.length} results.`);
        results.results.slice(0, 3).forEach((r: any) => {
            console.log(`\n[${r.title}]`);
            console.log(`    ${r.url}`);
        });
    } catch (error: any) {
        console.error('Lib Failed:', error.message);
    }
}

testLib();
