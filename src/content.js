(() => {
    if (window.hasRun) {
        return; // Prevent the script from running multiple times
    }
    window.hasRun = true;

    const csvUrl = chrome.runtime.getURL("RiskyShops.csv");
    let riskyDomains = [];
    let scannerEnabled = true;
    let lastCheckedDomain = null;

    // Check if the scanner is enabled
    chrome.storage.local.get(["scannerEnabled"], (data) => {
        scannerEnabled = data.scannerEnabled ?? true; // Default to enabled if undefined
        if (scannerEnabled) {
            loadDomainsAndCheck();
        }
    });

    // Listen for changes to the scanner state
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.scannerEnabled) {
            scannerEnabled = changes.scannerEnabled.newValue;
            if (!scannerEnabled) {
                removeBanner(); // Remove the banner if the scanner is disabled
            }
        }
    });

    async function loadDomainsAndCheck() {
        if (riskyDomains.length === 0) {
            const response = await fetch(csvUrl);
            const csvText = await response.text();

            // Parse CSV and extract only the domains (first column)
            riskyDomains = csvText
                .split("\n") // Split by line
                .map((line) => line.split(",")[0].trim().replace(/^www\./, "")) // Extract the first column (domain) and remove "www."
                .filter((domain) => domain && domain !== "Domain"); // Remove empty lines and header
        }

        checkDomain(); // Initial check after loading domains
    }

    function checkDomain() {
        if (!scannerEnabled) return; // Stop if the scanner is disabled

        const currentDomain = window.location.hostname.replace(/^www\./, ""); // Normalize current domain
        if (currentDomain === lastCheckedDomain) return; // Skip if the domain hasn't changed

        lastCheckedDomain = currentDomain; // Update the last checked domain
        console.log("Current domain:", currentDomain);
        console.log("Risky domains:", riskyDomains);

        const bannerId = "risky-site-banner";

        // Remove existing banner and reset margin if not risky
        const existingBanner = document.getElementById(bannerId);
        if (!riskyDomains.includes(currentDomain)) {
            if (existingBanner) {
                existingBanner.remove();
                document.body.style.marginTop = ""; // Reset margin
            }
            return;
        }

        // Add banner if risky
        if (!existingBanner) {
            const banner = document.createElement("div");
            banner.id = bannerId;
            banner.textContent = "Táto stránka je nebezpečná / This website is risky!";
            banner.style.position = "fixed";
            banner.style.top = "0";
            banner.style.left = "0";
            banner.style.width = "100%";
            banner.style.backgroundColor = "red";
            banner.style.color = "white";
            banner.style.textAlign = "center";
            banner.style.padding = "10px";
            banner.style.zIndex = "10000";
            banner.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.2)";
            document.body.appendChild(banner);

            // Push the page content down
            const bannerHeight = banner.offsetHeight;
            document.body.style.marginTop = `${bannerHeight}px`;
        }
    }

    // Monitor domain changes
    let previousUrl = window.location.href;
    const observer = new MutationObserver(() => {
        if (window.location.href !== previousUrl) {
            previousUrl = window.location.href;
            checkDomain(); // Check the domain when the URL changes
        }
    });

    observer.observe(document, { subtree: true, childList: true });
})();