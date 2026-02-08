
document.getElementById('analyzeBtn').addEventListener('click', async () => {
    // Get current tab URL
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab && tab.url) {
        // Construct Steelman URL
        const steelmanUrl = `http://localhost:3000/analyze?url=${encodeURIComponent(tab.url)}`;

        // Open in new tab
        chrome.tabs.create({ url: steelmanUrl });
    }
});
