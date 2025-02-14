document.addEventListener("DOMContentLoaded", async function() {
    var statusMsg = document.getElementById("status"),
    checkBtn = document.getElementById("check"),
    updateBtn = document.getElementById("update"),
    header = document.getElementById("header");

    async function checkSite() {
        var [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        var url = tab.url;

        var { phishingList = [] } = await chrome.storage.local.get("phishingList");
        var isPhishing = phishingList.some(entry => url.includes(entry.DomainAddress));
        setTimeout(function() {
            statusMsg.innerHTML = isPhishing ? "⚠️ Phishing Site" : "✅ Safe Site";
            header.style.backgroundColor = statusMsg.style.color = isPhishing ? "red" : "green";
        }, 1000);
    }

    checkBtn.addEventListener("click", async function() {
        statusMsg.textContent = "Checking...";
        await checkSite();
    });

    updateBtn.addEventListener("click", async function() {
        statusMsg.textContent = "Updating...";
        await chrome.runtime.sendMessage({ action: "updateData" });
        await checkSite();
    });

    await checkSite();
});