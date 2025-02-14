async function updatePhishingData() {
    try {
        var response = await fetch("https://raw.githubusercontent.com/vishwas-r/phishing-links-database/refs/heads/main/domains.json");
        var data = await response.json();
        await chrome.storage.local.set({ phishingList: data });
        console.log("Phishing data updated.");
    } catch (error) {
        console.error("Failed to update phishing data:", error);
    }
}

async function checkUrl(url) {
    var { phishingList = [] } = await chrome.storage.local.get("phishingList");
    return phishingList.some(entry => url.includes(entry.DomainAddress));
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        var isPhishing = await checkUrl(tab.url);
        chrome.action.setIcon({
            tabId,
            path: isPhishing ? "icons/alert.png" : "icons/safe.png"
        });
    }
});

chrome.runtime.onInstalled.addListener(updatePhishingData);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateData") {
        updatePhishingData();
        sendResponse({ status: "Updating..." });
    }
});