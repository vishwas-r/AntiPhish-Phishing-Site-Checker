async function openDB() {
    return new Promise((resolve, reject) => {
        var request = indexedDB.open("PhishingDB", 1);

        request.onupgradeneeded = function (event) {
            var db = event.target.result;
            if (!db.objectStoreNames.contains("phishingData")) {
                db.createObjectStore("phishingData", { keyPath: "source" });
            }
            if (!db.objectStoreNames.contains("settings")) {
                db.createObjectStore("settings", { keyPath: "key" });
            }
        };

        request.onsuccess = function (event) {
            resolve(event.target.result);
        };

        request.onerror = function (event) {
            reject("Error opening IndexedDB:", event.target.error);
        };
    });
}

async function savePhishingData(source, data) {
    var db = await openDB();
    return new Promise((resolve, reject) => {
        var transaction = db.transaction("phishingData", "readwrite");
        var store = transaction.objectStore("phishingData");
        store.put({ source, data });

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject("Failed to save phishing data");
    });
}

async function getPhishingData() {
    var db = await openDB();
    return new Promise((resolve, reject) => {
        var transaction = db.transaction("phishingData", "readonly");
        var store = transaction.objectStore("phishingData");
        var request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Failed to retrieve phishing data");
    });
}

async function saveSelectedSources(sources) {
    var db = await openDB();
    return new Promise((resolve, reject) => {
        var transaction = db.transaction("settings", "readwrite");
        var store = transaction.objectStore("settings");
        store.put({ key: "selectedSources", value: sources });

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject("Failed to save settings");
    });
}

async function getSelectedSources() {
    var db = await openDB();
    return new Promise((resolve, reject) => {
        var transaction = db.transaction("settings", "readonly");
        var store = transaction.objectStore("settings");
        var request = store.get("selectedSources");

        request.onsuccess = () => resolve(request.result?.value || []);
        request.onerror = () => reject("Failed to retrieve settings");
    });
}
