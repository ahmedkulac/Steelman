
import axios from 'axios';
import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';

// const targetUrl = 'https://www.cnn.com/2024/02/07/politics/senate-border-ukraine-israel-aid-vote/index.html';
const targetUrl = 'https://apnews.com/article/trump-obama-racist-video-tim-scott-067cf84eea0ec4a03122d6';
const url = targetUrl;
const logFile = 'debug_output_cache.txt';

function log(msg: string) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

async function debugFetch() {
    // Clear log file
    fs.writeFileSync(logFile, '');

    log(`Debug Log for Fetching: ${url}`);
    log(`Time: ${new Date().toISOString()}`);

    const httpsAgent = new https.Agent({ family: 4, rejectUnauthorized: false });
    const httpAgent = new http.Agent({ family: 4 });

    // List of social bots to try
    const bots = [
        'Twitterbot/1.0',
        'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)',
        'Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)'
    ];

    for (const bot of bots) {
        try {
            log(`\n--- Trying Bot UA: ${bot} ---`);
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': bot,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                },
                timeout: 10000,
                httpsAgent,
                httpAgent,
                validateStatus: (status) => status < 500
            });

            log(`Status: ${response.status}`);
            if (response.status === 200 && response.data.length > 2000) {
                log('SUCCESS! This bot works.');
                log(response.data.substring(0, 500));
                return; // Found a working one
            }
        } catch (err: any) {
            log(`Failed: ${err.message}`);
            if (err.response) log(`Response Status: ${err.response.status}`);
        }
    }

    const userAgent = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

    // Check Wayback Machine
    const waybackApiUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(targetUrl)}`;

    try {
        log(`--- Checking Wayback Machine: ${waybackApiUrl} ---`);
        const response = await axios.get(waybackApiUrl, {
            timeout: 15000,
            httpsAgent,
            httpAgent
        });

        log(`Wayback API Status: ${response.status}`);
        if (response.data && response.data.archived_snapshots && response.data.archived_snapshots.closest) {
            log('Snapshot FOUND!');
            log(`Snapshot URL: ${response.data.archived_snapshots.closest.url}`);

            // Try fetching the snapshot
            const snapshotUrl = response.data.archived_snapshots.closest.url;
            log(`\n--- Fetching Snapshot ---`);
            const snapshotResponse = await axios.get(snapshotUrl, {
                timeout: 30000, // Snapshots can be slow
                httpsAgent,
                httpAgent,
                maxRedirects: 10
            });
            log(`Snapshot Fetch Status: ${snapshotResponse.status}`);
            log(`Snapshot Data Length: ${snapshotResponse.data.length}`);
            if (snapshotResponse.status === 200) {
                log('Content Preview (first 500 chars):');
                log(snapshotResponse.data.substring(0, 500));
            }
        } else {
            log('No snapshot found in Wayback Machine.');
        }
    } catch (err: any) {
        log(`ERROR: ${err.message}`);
        if (err.response) {
            log(`Response Status: ${err.response.status}`);
        }
    }
}

debugFetch();
