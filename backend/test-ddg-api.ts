
import axios from 'axios';

async function testInstantAnswer() {
    console.log('Testing DDG Instant Answer API...');
    try {
        // Query needs to be broad for Instant Answers (e.g., "Earth" vs "Earth is flat evidence")
        // But let's try the specific one first.
        const query = "Flat Earth";
        const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;

        const response = await axios.get(url);
        const data = response.data;

        console.log('AbstractURL:', data.AbstractURL);
        console.log('RelatedTopics:', data.RelatedTopics.length);

        data.RelatedTopics.slice(0, 3).forEach((t: any) => {
            if (t.FirstURL) {
                console.log(` - ${t.Text} -> ${t.FirstURL}`);
            }
        });

    } catch (error: any) {
        console.error('Failed:', error.message);
    }
}

testInstantAnswer();
