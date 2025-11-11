/* global settings */

function withPluginApi(callback) {
  if (typeof require !== "function") {
    return false;
  }

  try {
    const { withPluginApi } = require("discourse/lib/plugin-api");
    if (typeof withPluginApi === "function") {
      withPluginApi("0.8", (api) => callback(api));
      return true;
    }
  } catch (error) {
    // no-op: plugin API not yet available in this context
  }

  return false;
}

const STYLE_ID = "nav-button-color-overrides";

function parseRules() {
  const current = settings.nav_button_color_pairs;

  if (Array.isArray(current)) {
    return current
      .map((item) => ({
        selector: (item?.selector || "").trim(),
        color: (item?.color || "").trim(),
      }))
      .filter((rule) => rule.selector && rule.color);
  }

  if (!current) {
    return [];
  }

  // Fallback: support legacy newline-separated list entries
  return String(current)
    .split("\n")
    .map((line) => line.split("|"))
    .map((parts) => ({
      selector: (parts[0] || "").trim(),
      color: (parts[1] || "").trim(),
    }))
    .filter((rule) => rule.selector && rule.color);
}

function ensureStyleTag() {
  let tag = document.head.querySelector(`#${STYLE_ID}`);
  if (!tag) {
    tag = document.createElement("style");
    tag.id = STYLE_ID;
    document.head.appendChild(tag);
  }
  return tag;
}

function injectStyles() {
  const tag = ensureStyleTag();
  const rules = parseRules();

  if (!rules.length) {
    tag.textContent = "";
    return;
  }

  tag.textContent = rules
    .map(({ selector, color }) => `
      ${selector} {
        background-color: ${color} !important;
        border: 1px solid ${color} !important;
        color: #fff !important;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.35rem 0.75rem;
        border-radius: 999px;
        transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
      }
      ${selector}:hover,
      ${selector}:focus {
        background-color: ${color} !important;
        border-color: ${color} !important;
        text-decoration: none;
      }
      ${selector}.active {
        box-shadow: 0 0 0 2px ${settings.active_outline_color || "rgba(255,255,255,0.85)"},
                    0 0 0 4px rgba(0, 0, 0, 0.08);
      }
    `)
    .join("\n");
}

function updateStyles() {
  if (!document.body) {
    return;
  }
  injectStyles();
}

function registerApiHooks() {
  const registered = withPluginApi((api) => {
    api.onPageChange(() => requestAnimationFrame(updateStyles));
    if (typeof api.onAppEvent === "function") {
      api.onAppEvent("theme-settings:changed", updateStyles);
    }
  });

  if (!registered) {
    document.addEventListener("turbo:render", () => requestAnimationFrame(updateStyles));
  }
}

function init() {
  updateStyles();
  registerApiHooks();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
