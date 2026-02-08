
const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/shutdown', // Try a graceful shutdown path first, though unlikely exist
    method: 'POST',
};

// Just try to kill the process by name if running via npm/node
const { exec } = require('child_process');

console.log('Attempting to kill backend process...');
exec('taskkill /IM node.exe /F', (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
});
