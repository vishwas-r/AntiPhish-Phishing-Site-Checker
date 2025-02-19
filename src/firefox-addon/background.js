async function updatePhishingData() {
    try {
        var { selectedSources = [] } = await browser.storage.local.get("selectedSources");

        if (!Array.isArray(selectedSources) || selectedSources.length === 0) {
            console.warn("No sources selected for update.");
            return;
        }

        var updatePromises = selectedSources.map(async (source) => {
            try {
                var response = await fetch(source.url);
                var data = await response.json();
                await browser.storage.local.set({ [source.source]: data });
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
    var storedData = await browser.storage.local.get();
    var isPhishing = Object.values(storedData).some(list =>
        Array.isArray(list) && list.some(phishingUrl => url.includes(phishingUrl))
    );
    return isPhishing;
}

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
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
        updatePhishingData().then(() => sendResponse({ status: "Updated" }));
        return true;
    }
});