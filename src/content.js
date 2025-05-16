(() => {
    if (window.hasRun) {
        return; // Prevent the script from running multiple times
    }
    window.hasRun = true;

    const csvUrl = chrome.runtime.getURL("RiskyShops.csv");
    let riskyDomainsMap = {}; // Map to store domain and corresponding PDF link
    let scannerEnabled = true;
    let lastCheckedDomain = null;

    // Remove the banner if it exists
    function removeBanner() {
        const existingBanner = document.getElementById("risky-site-banner");
        if (existingBanner) {
            existingBanner.remove();
            document.body.style.marginTop = ""; // Reset margin
        }
    }

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
        if (Object.keys(riskyDomainsMap).length === 0) {
            const response = await fetch(csvUrl);
            const csvText = await response.text();

            // Parse CSV and extract domains and PDF links
            riskyDomainsMap = csvText
                .split("\n") // Split by line
                .slice(1) // Skip the header row
                .reduce((map, line) => {
                    const [domain, pdfLink] = line.split(",").map((item) => item.trim());
                    if (domain && pdfLink) {
                        map[domain.replace(/^www\./, "")] = pdfLink; // Remove "www." and store in map
                    }
                    return map;
                }, {});
        }

        checkDomain(); // Initial check after loading domains
    }

    function checkDomain() {
        if (!scannerEnabled) return; // Stop if the scanner is disabled

        const currentDomain = window.location.hostname.replace(/^www\./, ""); // Normalize current domain
        if (currentDomain === lastCheckedDomain) return; // Skip if the domain hasn't changed

        lastCheckedDomain = currentDomain; // Update the last checked domain
        console.log("Current domain:", currentDomain);
        console.log("Risky domains map:", riskyDomainsMap);

        const bannerId = "risky-site-banner";

        // Remove existing banner and reset margin if not risky
        const existingBanner = document.getElementById(bannerId);
        if (!riskyDomainsMap[currentDomain]) {
            if (existingBanner) {
                existingBanner.remove();
                document.body.style.marginTop = ""; // Reset margin
            }

            // Notify background script to reset the icon
            chrome.runtime.sendMessage({ action: "resetIcon" });
            return;
        }

        // Add banner if risky
        if (!existingBanner) {
            const banner = document.createElement("div");
            banner.id = bannerId;
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

            // Add warning text
            const warningText = document.createElement("span");
            warningText.textContent = "Warning: This website is risky! ";
            banner.appendChild(warningText);

            // Add PDF link
            const pdfLink = document.createElement("a");
            pdfLink.href = riskyDomainsMap[currentDomain]; // Get the PDF link for the current domain
            pdfLink.textContent = "Learn more";
            pdfLink.style.color = "white";
            pdfLink.style.textDecoration = "underline";
            pdfLink.target = "_blank"; // Open link in a new tab
            banner.appendChild(pdfLink);

            document.body.appendChild(banner);

            // Push the page content down
            const bannerHeight = banner.offsetHeight;
            document.body.style.marginTop = `${bannerHeight}px`;
        }

        // Notify background script to change the icon
        chrome.runtime.sendMessage({ action: "setRiskyIcon" });
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