window.onload = function() {
  chrome.storage.sync.get("searchQuery", (data) => {
    const searchQuery = data.searchQuery || "";
    const searchBox = document.querySelector('input[placeholder="Search"]');
    console.log(`before if: ${searchBox}`); // Logging for debugging
    
    if (searchBox) {
      // Enter the search query into the search box
      searchBox.value = searchQuery;
      searchBox.dispatchEvent(new Event('input', { bubbles: true }));
      searchBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      console.log(`before starting search query: ${searchQuery}`); // Logging for debugging

      // Wait for the search results to load using MutationObserver
      const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
          if (mutation.addedNodes.length > 0) {
            // Check if the People filter button is available
            const peopleFilter = Array.from(document.querySelectorAll('button'))
              .find(button => button.textContent.trim() === 'People');

            if (peopleFilter) {
              observer.disconnect();
              peopleFilter.click();

              // Wait for the people results to load and then extract the profile URLs of the top 3 people
              setTimeout(() => {
                const profileLinks = [];
                const profileElements = document.querySelectorAll('.entity-result__title-line a');
                for (let i = 0; i < Math.min(profileElements.length, 3); i++) {
                  const href = profileElements[i].getAttribute('href');
                  const url = new URL(href, window.location.origin).href;
                  console.log("Before pushing Profile URL: ", url); // Logging for debugging
                  profileLinks.push(url);
                }

                console.log("Collected profile links: ", profileLinks); // Logging for debugging

                // Store the profile links and navigate to each one to take screenshots
                chrome.storage.sync.set({ profileLinks: profileLinks }, () => {
                  chrome.runtime.sendMessage({ action: "openProfilesAndTakeScreenshots" });
                });

              }, 5000); // Increased delay to ensure the people results are loaded
            }
          }
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }
  });
};
