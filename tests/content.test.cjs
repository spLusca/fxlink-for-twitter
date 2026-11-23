
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const script = fs.readFileSync(
  path.join(__dirname, "..", "content.js"),
  "utf8"
);

/**
 * Creates an isolated environment for testing the content script.
 *
 * @returns {object} The browser mocks and recorded clipboard writes.
 */
function createTestEnvironment() {
  const clipboardWrites = [];
  const listeners = {};

  const windowMock = {
    getSelection: () => ({ toString: () => "" }),
    addEventListener: (type, handler) => {
      listeners[type] = handler;
    }
  };

  const documentMock = {
    addEventListener: (type, handler) => {
      listeners[type] = handler;
    }
  };

  const clipboard = {
    writeText: async (text) => {
      clipboardWrites.push(text);
    }
  };

  vm.runInNewContext(script, {
    window: windowMock,
    document: documentMock,
    navigator: { clipboard },
    console,
    URL,
    Set
  });

  return {
    clipboard,
    clipboardWrites,
    listeners,
    windowMock
  };
}

test("converts an X post URL to FxTwitter", async () => {
  const env = createTestEnvironment();

  await env.clipboard.writeText(
    "https://x.com/DiscussingFilm/status/2124865847055237510"
  );

  assert.deepEqual(env.clipboardWrites, [
    "https://fxtwitter.com/DiscussingFilm/status/2124865847055237510"
  ]);
});

test("converts legacy Twitter URLs", async () => {
  const env = createTestEnvironment();

  await env.clipboard.writeText(
    "https://twitter.com/example/status/123456789"
  );

  assert.equal(
    env.clipboardWrites[0],
    "https://fxtwitter.com/example/status/123456789"
  );
});

test("removes tracking parameters", async () => {
  const env = createTestEnvironment();

  await env.clipboard.writeText(
    "https://x.com/example/status/123456789?s=20"
  );

  assert.equal(
    env.clipboardWrites[0],
    "https://fxtwitter.com/example/status/123456789"
  );
});

test("preserves unrelated URLs", async () => {
  const env = createTestEnvironment();

  await env.clipboard.writeText(
    "https://github.com/example/project"
  );

  assert.equal(
    env.clipboardWrites[0],
    "https://github.com/example/project"
  );
});

test("preserves ordinary text", async () => {
  const env = createTestEnvironment();

  await env.clipboard.writeText("Hello world!");

  assert.equal(env.clipboardWrites[0], "Hello world!");
});

test("preserves links when conversion is disabled", async () => {
  const env = createTestEnvironment();

  env.listeners.message({
    source: env.windowMock,
    data: {
      source: "fxlink-extension",
      type: "SET_ENABLED",
      enabled: false
    }
  });

  await env.clipboard.writeText(
    "https://x.com/example/status/123456789"
  );

  assert.equal(
    env.clipboardWrites[0],
    "https://x.com/example/status/123456789"
  );
});

test("converts selected URLs during native copy events", () => {
  const env = createTestEnvironment();

  env.windowMock.getSelection = () => ({
    toString: () => "https://x.com/example/status/123456789"
  });

  let copiedText = null;
  let wasPrevented = false;

  env.listeners.copy({
    clipboardData: {
      setData: (type, value) => {
        assert.equal(type, "text/plain");
        copiedText = value;
      }
    },
    preventDefault: () => {
      wasPrevented = true;
    }
  });

  assert.equal(
    copiedText,
    "https://fxtwitter.com/example/status/123456789"
  );

  assert.equal(wasPrevented, true);
});
