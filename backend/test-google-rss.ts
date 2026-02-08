
import axios from 'axios';
import { JSDOM } from 'jsdom';

async function testGoogleNews() {
    console.log('Testing Google News RSS...');
    try {
        const query = "flat earth evidence";
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;

        // Use a browser-like User-Agent
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // Parse XML
        const dom = new JSDOM(response.data, { contentType: "text/xml" });
        const items = dom.window.document.querySelectorAll('item');

        console.log(`Found ${items.length} items.`);

        for (let i = 0; i < Math.min(items.length, 3); i++) {
            const item = items[i];
            const title = item.querySelector('title')?.textContent;
            const link = item.querySelector('link')?.textContent;
            const pubDate = item.querySelector('pubDate')?.textContent;

            console.log(`\n[${i + 1}] ${title}`);
            console.log(`    Link: ${link}`);
            console.log(`    Date: ${pubDate}`);
        }

    } catch (error: any) {
        console.error('RSS Failed:', error.message);
    }
}

testGoogleNews();
