// Track the state of each tab
const tabStates = {};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "setRiskyIcon") {
        if (sender.tab && sender.tab.id) {
            // Mark the tab as risky
            tabStates[sender.tab.id] = "risky";

            // Change the icon to riskyIcon.png
            chrome.action.setIcon({ path: chrome.runtime.getURL("riskyIcon.png"), tabId: sender.tab.id }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Failed to set risky icon:", chrome.runtime.lastError.message);
                }
            });
        } else {
            console.error("No tab ID found for setRiskyIcon.");
        }
    } else if (message.action === "resetIcon") {
        if (sender.tab && sender.tab.id) {
            // Mark the tab as safe
            tabStates[sender.tab.id] = "safe";

            // Reset the icon to the default icon
            chrome.action.setIcon({ path: chrome.runtime.getURL("icon.png"), tabId: sender.tab.id }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Failed to reset icon:", chrome.runtime.lastError.message);
                }
            });
        } else {
            console.error("No tab ID found for resetIcon.");
        }
    }
});

// Handle tab updates to ensure the icon state is consistent
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tabStates[tabId]) {
        // Reapply the icon based on the tab's state
        const iconPath = tabStates[tabId] === "risky" ? "riskyIcon.png" : "icon.png";
        chrome.action.setIcon({ path: chrome.runtime.getURL(iconPath), tabId: tabId }, () => {
            if (chrome.runtime.lastError) {
                console.error("Failed to update icon on tab update:", chrome.runtime.lastError.message);
            }
        });
    }
});

// Clean up tabStates when a tab is removed
chrome.tabs.onRemoved.addListener((tabId) => {
    delete tabStates[tabId];
});