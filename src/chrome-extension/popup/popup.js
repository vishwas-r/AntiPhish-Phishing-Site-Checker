document.addEventListener("DOMContentLoaded", async function () {
    var statusMsg = document.getElementById("status"),
        verifyUrlBtn = document.getElementById("verifyURL"),
        updateDbBtn = document.getElementById("updateDB"),
        header = document.getElementById("header"),
        sourceCheckboxes = document.querySelectorAll("#sources input[type='checkbox']");

    async function getSelectedSources() {
        var { selectedSources = [] } = await chrome.storage.local.get("selectedSources");
        return selectedSources;
    }

    async function saveSelectedSources() {
        var selectedSources = Array.from(sourceCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => ({ source: cb.value, url: cb.getAttribute("data-url") }));

        await chrome.storage.local.set({ selectedSources });
    }

    async function checkSite() {
        statusMsg.textContent = "⏳Checking Site, Please Wait...";
        statusMsg.style.color = "#333";

        var [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        var url = tab.url;

        var phishingLists = await chrome.storage.local.get();
        var isPhishing = Object.values(phishingLists).some(list =>
            Array.isArray(list) && list.some(phishingUrl => url.includes(phishingUrl))
        );

        setTimeout(function () {
            statusMsg.innerText = isPhishing ? "⚠️Phishing Site" : "✅Safe Site";
            header.style.backgroundColor = statusMsg.style.color = isPhishing ? "red" : "green";
        }, 500);
    }

    async function updateSourceCounts() {
        var storedData = await chrome.storage.local.get(null);

        sourceCheckboxes.forEach(cb => {
            var sourceName = cb.value;
            var count = Array.isArray(storedData[sourceName]) ? storedData[sourceName].length : 0;

            var span = cb.nextElementSibling;
            if (span && span.tagName === "SPAN") {
                span.textContent = ` ${sourceName} (${count} URLs)`;
            }
        });
    }

    function updateButtonState() {
        var anyChecked = Array.from(sourceCheckboxes).some(cb => cb.checked);
        updateDbBtn.disabled = !anyChecked;
        updateDbBtn.style.backgroundColor = anyChecked ? "" : "grey";
    }

    function handleCheckboxChange() {
        saveSelectedSources();
        updateButtonState();
    }

    sourceCheckboxes.forEach(cb => {
        cb.addEventListener("change", handleCheckboxChange);
    });

    verifyUrlBtn.addEventListener("click", async function () {
        await checkSite();
    });

    updateDbBtn.addEventListener("click", async function () {
        statusMsg.textContent = "⏳Updating Database...";
        statusMsg.style.color = "#ff8c00";

        await chrome.runtime.sendMessage({ action: "updateData" });

        statusMsg.textContent = "✅Database Updated";
        statusMsg.style.color = "green";

        await updateSourceCounts();
    });

    var selectedSources = await getSelectedSources();
    sourceCheckboxes.forEach(cb => {
        cb.checked = selectedSources.some(src => src.source === cb.value);
    });

    await updateSourceCounts();
    updateButtonState();
    await checkSite();
});