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

    // Get text translations based on browser language
    const translations = (() => {
        const lang = navigator.language || 'en';
        if (lang.toLowerCase().startsWith("sk")) {
            return {
                bannerText: "Upozornenie: Táto stránka je riziková! ",
                linkText: "Dozvedieť sa viac"
            };
        }
        return {
            bannerText: "Warning: This website is risky! ",
            linkText: "Learn more"
        };
    })();

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

    let actionElement;
    const pdfLink = riskData.pdfLink ? riskData.pdfLink.trim() : "";
    // If pdfLink is blank or a dash, show description.
    if (pdfLink === "" || pdfLink === "-") {
        actionElement = document.createElement("span");
        actionElement.textContent = riskData.description;
        actionElement.style.color = "white";
    } else {
        actionElement = document.createElement("a");
        actionElement.href = pdfLink;
        actionElement.textContent = translations.linkText;
        actionElement.style.color = "white";
        actionElement.style.textDecoration = "underline";
        actionElement.target = "_blank";
    }
    
    // Set banner content with leading banner text and the action element appended.
    banner.innerHTML = translations.bannerText + " ";
    banner.appendChild(actionElement);
    
    document.body.appendChild(banner);
    // Push the page content down based on banner height.
    const bannerHeight = banner.offsetHeight;
    document.body.style.marginTop = `${bannerHeight}px`;
}

async function getUserIp() {
    try {
        const response = await fetch("https://api.ipify.org?format=json");
        if (!response.ok) {
            throw new Error(`Failed to fetch IP: ${response.statusText}`);
        }
        const data = await response.json();
        return data.ip; // Returns the user's IP address
    } catch (error) {
        console.error("Error fetching user IP:", error);
        return "0.0.0.0"; // Fallback IP in case of an error
    }
}

async function getUserIp() {
    try {
        const response = await fetch("https://api.ipify.org?format=json");
        if (!response.ok) {
            throw new Error(`Failed to fetch IP: ${response.statusText}`);
        }
        const data = await response.json();
        return data.ip; // Returns the user's IP address
    } catch (error) {
        console.error("Error fetching user IP:", error);
        return "0.0.0.0"; // Fallback IP in case of an error
    }
}

// Function to send the POST request
async function sendRiskyWebsiteData() {
    const userIp = await getUserIp(); // Wait for the user's IP to be fetched
    const currentDomain = window.location.href; // Get the current domain

    fetch("http://127.0.0.1:3000/api/v1/visits", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-Key": "a3ae84db488acdb9278b4dc59137ea2095cdda2ff6cbad6f531c2966601d6179"
        },
        body: JSON.stringify({
            visit: {
                ip: userIp,
                domain: currentDomain
            }
        })
    })
    .then(response => {
        if (!response.ok) {
            console.error("Failed to send risky website data:", response.statusText);
        } else {
            console.log("Risky website data sent successfully.");
        }
    })
    .catch(error => {
        console.error("Error sending risky website data:", error);
    });
}

// Call the function when needed (e.g., after showing the banner)
sendRiskyWebsiteData();

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