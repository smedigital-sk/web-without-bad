document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("scannerToggle");

    // Set translations for popup texts based on browser language
    const lang = navigator.language || 'en';
    const popupTexts = lang.toLowerCase().startsWith("sk")
        ? {
            title: "Skener nebezpečných stránok",
            toggleText: "ON / OFF"
          }
        : {
            title: "Unsecure Websites Scanner",
            toggleText: "ON / OFF"
          };

    document.querySelector("h1").textContent = popupTexts.title;
    document.getElementById("toggleText").textContent = popupTexts.toggleText;

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