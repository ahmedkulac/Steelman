
import axios from 'axios';

async function testAnalyze() {
    const targetUrl = 'https://www.google.com'; // Use google.com as simple example

    console.log(`Testing POST http://localhost:5001/api/analyze with URL: ${targetUrl}`);

    try {
        const response = await axios.post('http://localhost:5001/api/analyze', {
            url: targetUrl
        }, {
            timeout: 30000 // 30s timeout for AI generation
        });

        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));

        if (response.data.title && response.data.analysis) {
            console.log('SUCCESS: Analysis returned correctly');
        } else {
            console.error('FAILURE: Unexpected response format');
            process.exit(1);
        }
    } catch (error: any) {
        console.error('--- ERROR DETAILS ---');
        if (error.code) {
            console.error('Error Code:', error.code);
        }
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('No response received.');
        } else {
            console.error('Error Message:', error.message);
        }
        console.error('---------------------');
        process.exit(1);
    }
}

testAnalyze();
