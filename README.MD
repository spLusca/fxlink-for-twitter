
# FxLink for Twitter

A lightweight Chromium browser extension that automatically converts copied Twitter/X post URLs into FxTwitter URLs.

## Features

- Automatically converts `x.com` links to `fxtwitter.com`
- Supports legacy `twitter.com` URLs
- Removes tracking parameters
- Enable or disable conversion through the extension popup
- Saves preferences between browser sessions
- Works with Brave and other compatible Chromium browsers
- No external dependencies required

## Example

Original URL:

https://x.com/ExampleAccount/status/123456789

Converted URL:

https://fxtwitter.com/ExampleAccount/status/123456789

## Installation

1. Download or clone this repository.
2. Open `brave://extensions` or `chrome://extensions`.
3. Enable Developer mode.
4. Click Load unpacked.
5. Select the extension's root directory.

## Usage

1. Open Twitter/X.
2. Find a post.
3. Click Share, then Copy link.
4. Paste the converted URL into Discord.

To disable conversion, open the FxLink popup and turn off Automatic conversion.

## Development

The extension uses JavaScript, HTML, CSS, and Manifest V3.

No build step is required.

## Disclaimer

This is an independent project and is not affiliated with X, Twitter, or FxTwitter.
