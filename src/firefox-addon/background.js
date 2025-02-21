async function updatePhishingData() {
    try {
        var selectedSources = await getSelectedSources();

        if (!Array.isArray(selectedSources) || selectedSources.length === 0) {
            console.warn("No sources selected for update.");
            return;
        }

        var updatePromises = selectedSources.map(async (source) => {
            try {
                var response = await fetch(source.url);
                var data = await response.json();
                await savePhishingData(source.source, data);
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
    var storedData = await getPhishingData();
    return storedData.some(entry => entry.data.some(phishingUrl => url.includes(phishingUrl)));
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