
import { generateSteelmanArgument } from './src/services/aiService';
import 'dotenv/config';

async function testGen() {
    console.log('Testing generateSteelmanArgument...');
    try {
        const result = await generateSteelmanArgument({
            claim: "The earth is flat",
            category: "science"
        });
        console.log('Success!', JSON.stringify(result, null, 2));
    } catch (error: any) {
        console.error('Failed:', error.message);
        if (error.response) {
            console.error('Data:', JSON.stringify(error.response.data));
        }
    }
}

testGen();
