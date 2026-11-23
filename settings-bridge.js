
(() => {
  "use strict";

  /**
   * Sends the saved extension state to the page script.
   *
   * @returns {Promise<void>}
   */
  async function synchronizeSettings() {
    const { enabled } = await chrome.storage.local.get({
      enabled: true
    });

    window.postMessage({
      source: "fxlink-extension",
      type: "SET_ENABLED",
      enabled
    }, "*");
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.enabled) {
      synchronizeSettings();
    }
  });

  synchronizeSettings();
})();
