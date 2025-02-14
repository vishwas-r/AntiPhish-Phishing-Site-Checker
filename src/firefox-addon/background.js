async function updatePhishingData() {
    try {
        var response = await fetch("https://raw.githubusercontent.com/vishwas-r/phishing-links-database/refs/heads/main/domains.json");
        var data = await response.json();
        await browser.storage.local.set({ phishingList: data });
        console.log("Phishing data updated.");
    } catch (error) {
        console.error("Failed to update phishing data:", error);
    }
}

async function checkUrl(url) {
    var { phishingList = [] } = await browser.storage.local.get("phishingList");
    return phishingList.some(entry => url.includes(entry.DomainAddress));
}

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        var isPhishing = await checkUrl(tab.url);
        browser.browserAction.setIcon({
            tabId,
            path: isPhishing ? "icons/alert.png" : "icons/safe.png"
        });
    }
});

browser.runtime.onInstalled.addListener(updatePhishingData);

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateData") {
        updatePhishingData();
        sendResponse({ status: "Updating..." });
    }
});