
(() => {
  "use strict";

  const SUPPORTED_HOSTS = new Set([
    "x.com",
    "www.x.com",
    "twitter.com",
    "www.twitter.com",
    "mobile.twitter.com"
  ]);

  let isEnabled = true;

  /**
   * Updates the extension state when settings change.
   *
   * @param {MessageEvent} event - The received window message.
   * @returns {void}
   */
  function handleSettingsMessage(event) {
    if (event.source !== window) {
      return;
    }

    const data = event.data;

    if (
      data?.source !== "fxlink-extension" ||
      data?.type !== "SET_ENABLED"
    ) {
      return;
    }

    if (typeof data.enabled === "boolean") {
      isEnabled = data.enabled;

      console.debug(
        "[FxLink] Automatic conversion:",
        isEnabled ? "enabled" : "disabled"
      );
    }
  }

  /**
   * Converts a Twitter post URL to an FxTwitter URL.
   *
   * @param {string} text - The original clipboard text.
   * @returns {string|null} The converted URL or null.
   */
  function convertTwitterUrl(text) {
    if (!isEnabled) {
      return null;
    }

    if (typeof text !== "string") {
      return null;
    }

    let url;

    try {
      url = new URL(text.trim());
    } catch {
      return null;
    }

    if (!SUPPORTED_HOSTS.has(url.hostname.toLowerCase())) {
      return null;
    }

    if (!["https:", "http:"].includes(url.protocol)) {
      return null;
    }

    const postMatch = url.pathname.match(
      /^\/([a-zA-Z0-9_]+)\/status\/(\d+)(\/(?:photo|video)\/\d+)?\/?$/
    );

    if (!postMatch) {
      return null;
    }

    const username = postMatch[1];
    const postId = postMatch[2];
    const mediaPath = postMatch[3] ?? "";

    return `https://fxtwitter.com/${username}/status/${postId}${mediaPath}`;
  }

  /**
   * Intercepts native copy events and replaces Twitter post URLs.
   *
   * @param {ClipboardEvent} event - The clipboard event.
   * @returns {void}
   */
  function handleCopy(event) {
    if (!isEnabled) {
      return;
    }

    const selectedText = window.getSelection()?.toString();

    const convertedUrl = convertTwitterUrl(selectedText);

    if (!convertedUrl || !event.clipboardData) {
      return;
    }

    event.clipboardData.setData("text/plain", convertedUrl);
    event.preventDefault();

    console.debug(
      "[FxLink] Converted copied URL:",
      convertedUrl
    );
  }

  /**
   * Intercepts Clipboard API writes from Twitter.
   *
   * @returns {void}
   */
  function interceptClipboardApi() {
    const clipboard = navigator.clipboard;

    if (!clipboard || typeof clipboard.writeText !== "function") {
      return;
    }

    const originalWriteText = clipboard.writeText.bind(clipboard);

    try {
      clipboard.writeText = function (text) {
        const convertedUrl = convertTwitterUrl(text);

        if (convertedUrl) {
          console.debug(
            "[FxLink] Converted clipboard URL:",
            convertedUrl
          );
        }

        return originalWriteText(convertedUrl ?? text);
      };
    } catch (error) {
      console.warn(
        "[FxLink] Clipboard interception unavailable:",
        error
      );
    }
  }

  /**
   * Initializes the extension functionality.
   *
   * @returns {void}
   */
  function initialize() {
    window.addEventListener(
      "message",
      handleSettingsMessage
    );

    document.addEventListener(
      "copy",
      handleCopy,
      true
    );

    interceptClipboardApi();

    console.debug("[FxLink] Extension initialized.");
  }

  initialize();
})();
