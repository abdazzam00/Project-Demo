document.getElementById('searchButton').addEventListener('click', () => {
  const query = document.getElementById('searchQuery').value;
  chrome.storage.sync.set({ searchQuery: query }, () => {
    chrome.tabs.create({ url: "https://www.linkedin.com" }, (tab) => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      });
    });
  });
});
