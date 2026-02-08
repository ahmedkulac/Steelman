
import axios from 'axios';

async function testClaimEndpoint() {
    console.log('Testing POST /api/claims...');
    try {
        const response = await axios.post('http://localhost:5000/api/claims', {
            claim: "The earth is flat and the moon landing was fake",
            category: "science"
        });
        console.log('Success!', response.status, response.data);
    } catch (error: any) {
        console.error('Failed:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('No response received');
        }
    }
}

testClaimEndpoint();
