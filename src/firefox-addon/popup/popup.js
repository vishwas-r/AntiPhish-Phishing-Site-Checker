document.addEventListener("DOMContentLoaded", async function () {
    var statusMsg = document.getElementById("status"),
        verifyUrlBtn = document.getElementById("verifyURL"),
        updateDbBtn = document.getElementById("updateDB"),
        header = document.getElementById("header"),
        sourceCheckboxes = document.querySelectorAll("#sources input[type='checkbox']");

    async function checkSite() {
        statusMsg.textContent = "⏳ Checking Site, Please Wait...";
        statusMsg.style.color = "#333";

        var [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        var url = tab.url;

        var phishingLists = await getPhishingData();
        var isPhishing = phishingLists.some(entry => entry.data.some(phishingUrl => url.includes(phishingUrl)));

        setTimeout(function () {
            statusMsg.innerText = isPhishing ? "⚠️ Phishing Site" : "✅ Safe Site";
            statusMsg.style.color = isPhishing ? "red" : "green";
        }, 500);
    }

    async function updateSourceCounts() {
        var storedData = await getPhishingData();

        sourceCheckboxes.forEach(cb => {
            var sourceName = cb.value;
            var count = storedData.find(entry => entry.source === sourceName)?.data.length || 0;

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
        var selectedSources = Array.from(sourceCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => ({ source: cb.value, url: cb.getAttribute("data-url") }));

        saveSelectedSources(selectedSources);
        updateButtonState();
    }

    sourceCheckboxes.forEach(cb => {
        cb.addEventListener("change", handleCheckboxChange);
    });

    verifyUrlBtn.addEventListener("click", async function () {
        await checkSite();
    });

    updateDbBtn.addEventListener("click", async function () {
        statusMsg.textContent = "⏳ Updating Database...";
        statusMsg.style.color = "#ff8c00";

        await browser.runtime.sendMessage({ action: "updateData" });

        statusMsg.textContent = "✅ Database Updated";
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