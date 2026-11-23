
const toggle = document.getElementById("enabledToggle");
const status = document.getElementById("status");

/**
 * Updates the displayed conversion status.
 *
 * @param {boolean} enabled - Whether conversion is enabled.
 * @returns {void}
 */
function updateStatus(enabled) {
  status.textContent = enabled
    ? "Conversion is enabled"
    : "Conversion is disabled";
}

chrome.storage.local.get({ enabled: true }).then(({ enabled }) => {
  toggle.checked = enabled;
  updateStatus(enabled);
});

toggle.addEventListener("change", async () => {
  const enabled = toggle.checked;

  await chrome.storage.local.set({ enabled });

  updateStatus(enabled);
});
