chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openProfilesAndTakeScreenshots") {
    chrome.storage.sync.get("profileLinks", (data) => {
      const profileLinks = data.profileLinks || [];
      if (profileLinks.length > 0) {
        console.log(`profileLinks: ${profileLinks}`);
        openProfilesAndCapture(profileLinks, 0);
      }
    });
  }
});

let activeTabs = 0; // Counter for the number of currently active tabs
const maxActiveTabs = 3; // Maximum number of tabs to be opened simultaneously

function openProfilesAndCapture(profileLinks, index) {
  if (index >= profileLinks.length || activeTabs >= maxActiveTabs) return;

  activeTabs++;
  chrome.tabs.create({ url: profileLinks[index] }, (tab) => {
    console.log(`Opened tab with ID: ${tab.id} for profile: ${profileLinks[index]}`);
    setTimeout(() => {
      captureScreenshot(tab.id, index, profileLinks);
    }, 7000); // Wait 7 seconds before taking the screenshot to ensure the page is fully loaded
  });

  // Open the next profile after a short delay to prevent overwhelming the browser
  setTimeout(() => {
    openProfilesAndCapture(profileLinks, index + 1);
  }, 5000);
}

function captureScreenshot(tabId, index, profileLinks) {
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError || !tab) {
      console.error(`Tab with ID: ${tabId} does not exist.`);
      activeTabs--;
      return;
    }

    chrome.tabs.captureVisibleTab(tab.windowId, {}, (image) => {
      if (chrome.runtime.lastError || !image) {
        console.error(`Failed to capture screenshot for tab ID: ${tabId}.`);
        activeTabs--;
        return;
      }

      chrome.downloads.download({
        url: image,
        filename: `profile_${index}.png`
      }, () => {
        console.log(`Screenshot captured for tab ID: ${tabId}`);
        setTimeout(() => {
          chrome.tabs.remove(tabId, () => {
            activeTabs--; // Decrement active tab count
            if (index + 1 < profileLinks.length) {
              openProfilesAndCapture(profileLinks, index + 1);
            }
          });
        }, 1000); // Wait 1 second before opening the next profile
      });
    });
  });
}
 