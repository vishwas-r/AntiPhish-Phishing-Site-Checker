async function updatePhishingData() {
    try {
        var { selectedSources = [] } = await chrome.storage.local.get("selectedSources");

        if (!Array.isArray(selectedSources) || selectedSources.length === 0) {
            console.warn("No sources selected for update.");
            return;
        }

        var updatePromises = selectedSources.map(async (source) => {
            try {
                var response = await fetch(source.url);
                var data = await response.json();
                await chrome.storage.local.set({ [source.source]: data });
                console.log(`Updated ${source.source}: ${data.length} entries`);
            } catch (error) {
                console.error(`Failed to update ${source.source}:`, error);
            }
        });

        await Promise.all(updatePromises);
        console.log("All phishing data updated.");
    } catch (error) {
        console.error("Failed to update phishing data:", error);
    }
}

async function checkUrl(url) {
    var storedData = await chrome.storage.local.get(null);
    var isPhishing = Object.values(storedData).some(list =>
        Array.isArray(list) && list.some(phishingUrl => url.includes(phishingUrl))
    );
    return isPhishing;
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
        updatePhishingData().then(() => sendResponse({ status: "Updated" }));
        return true;
    }
});
