
import axios from 'axios';
import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';

const targetUrl = 'https://www.cnn.com/2026/02/07/us/hanceville-alabama-police-reckoning';
const url = `https://webcache.googleusercontent.com/search?q=cache:${encodeURIComponent(targetUrl)}`;
const logFile = 'debug_output_cache.txt';

function log(msg: string) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

async function debugFetch() {
    fs.writeFileSync(logFile, `Debug Log for Fetching: ${url}\n\n`);

    const httpsAgent = new https.Agent({ family: 4, rejectUnauthorized: false });
    const httpAgent = new http.Agent({ family: 4 });

    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    ];

    for (const ua of userAgents) {
        log(`\n--- Trying UA: ${ua.substring(0, 50)}... ---`);
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': ua,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Cache-Control': 'max-age=0',
                },
                timeout: 10000,
                maxRedirects: 5,
                validateStatus: (status) => status < 500,
                httpsAgent,
                httpAgent,
            });

            log(`Status: ${response.status}`);
            log(`Content-Type: ${response.headers['content-type']}`);
            log(`Content-Length Header: ${response.headers['content-length']}`);
            log(`Actual Data Length: ${response.data.length}`);

            if (response.status === 200) {
                log('SUCCESS (HTTP 200)!');
                if (response.data.length < 1000) {
                    log('WARNING: Content is very short!');
                    log('Content Preview:');
                    log(response.data);
                } else {
                    log('Content Preview (first 500 chars):');
                    log(response.data.substring(0, 500));
                }
                return;
            } else {
                log(`Failed with status: ${response.status}`);
            }
        } catch (err: any) {
            log(`ERROR: ${err.message}`);
            if (err.code) log(`Code: ${err.code}`);
            if (err.response) {
                log(`Response Status: ${err.response.status}`);
                log(`Response Data: ${err.response.data ? (typeof err.response.data === 'string' ? err.response.data.substring(0, 100) : 'JSON Data') : 'No Data'}`);
            }
        }
    }
}

debugFetch();
