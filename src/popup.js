document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("scannerToggle");

    // Initialize the toggle state
    chrome.storage.local.get(["scannerEnabled"], (data) => {
        toggle.checked = data.scannerEnabled ?? true; // Default to enabled if undefined
    });

    // Save the toggle state when changed
    toggle.addEventListener("change", () => {
        const enabled = toggle.checked;
        chrome.storage.local.set({ scannerEnabled: enabled }, () => {
            console.log("Scanner state saved:", enabled);
        });

        // Notify the background script about the change
        chrome.runtime.sendMessage({
            action: "toggleScanner",
            enabled: enabled
        });
    });
});