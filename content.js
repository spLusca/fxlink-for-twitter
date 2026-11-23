
(() => {
  "use strict";

  const SUPPORTED_HOSTS = new Set([
    "x.com",
    "www.x.com",
    "twitter.com",
    "www.twitter.com",
    "mobile.twitter.com"
  ]);

  /**
   * Converts a Twitter post URL to an FxTwitter URL.
   *
   * @param {string} text - The original clipboard text.
   * @returns {string|null} The converted URL or null.
   */
  function convertTwitterUrl(text) {
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
    const selectedText = window.getSelection()?.toString();

    const convertedUrl = convertTwitterUrl(selectedText);

    if (!convertedUrl || !event.clipboardData) {
      return;
    }

    event.clipboardData.setData("text/plain", convertedUrl);
    event.preventDefault();

    console.debug("[FxLink] Converted copied URL:", convertedUrl);
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
          console.debug("[FxLink] Converted clipboard URL:", convertedUrl);
        }

        return originalWriteText(convertedUrl ?? text);
      };
    } catch (error) {
      console.warn("[FxLink] Clipboard interception unavailable:", error);
    }
  }

  document.addEventListener("copy", handleCopy, true);

  interceptClipboardApi();
})();
