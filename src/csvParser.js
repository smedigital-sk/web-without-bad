async function loadRiskyDomains() {
    const response = await fetch(chrome.runtime.getURL("RiskyShops.csv"));
    const csvText = await response.text();

    const lines = csvText.split("\n");
    const domains = [];

    for (let i = 1; i < lines.length; i++) { // Skip the header row
        const line = lines[i].trim();
        if (line) {
            const [domain] = line.split(",");
            domains.push(domain);
        }x
    }

    return domains;
}

// Example usage
loadRiskyDomains().then((domains) => {
    console.log("Loaded risky domains:", domains);
});