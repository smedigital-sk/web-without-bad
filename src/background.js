chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggleScanner") {
        chrome.storage.local.set({ scannerEnabled: message.enabled });
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        chrome.storage.local.get(["scannerEnabled"], (data) => {
            if (data.scannerEnabled) {
                // Skip restricted or unsupported URLs
                if (
                    tab.url.startsWith("chrome://") ||
                    tab.url.startsWith("chrome-extension://") ||
                    tab.url.includes("chrome_newtab") ||
                    tab.url.startsWith("about:")
                ) {
                    console.log(`Skipping restricted URL: ${tab.url}`);
                    return;
                }

                // Inject content script into supported pages
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ["src/content.js"]
                });
            }
        });
    }
});