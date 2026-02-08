
import axios from 'axios';
import fs from 'fs';

async function debuDDG() {
    try {
        const response = await axios.get('https://html.duckduckgo.com/html/?q=test', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        fs.writeFileSync('ddg_debug.html', response.data);
        console.log('Saved ddg_debug.html');
    } catch (err: any) {
        console.error(err.message);
    }
}

debuDDG();
