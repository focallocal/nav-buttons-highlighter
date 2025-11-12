import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("1.8.0", (api) => {
  const settings = require("discourse/lib/theme-settings-store").getObjectForTheme(
    api.container.lookup("service:theme-settings-store").themeName
  );
  
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
const ANCHOR_TOKEN = /(^|[>+~\s])a([.#:[\s>+~]|$)/i;

function dedupe(list) {
  return Array.from(new Set((list || []).filter(Boolean)));
}

function expandSelectors(selector) {
  const trimmed = (selector || "").trim();
  if (!trimmed) {
    return null;
  }

  const anchorSelectors = new Set();
  const parentSelectors = new Set();

  if (ANCHOR_TOKEN.test(trimmed)) {
    anchorSelectors.add(trimmed);
  } else {
    parentSelectors.add(trimmed);
    anchorSelectors.add(`${trimmed} > a`);
    anchorSelectors.add(`${trimmed} a`);
  }

  return {
    anchorSelectors: Array.from(anchorSelectors),
    parentSelectors: Array.from(parentSelectors),
  };
}

function buildCssBlock(selector, color, outlineColor) {
  const expanded = expandSelectors(selector);
  if (!expanded) {
    return "";
  }

  const { anchorSelectors, parentSelectors } = expanded;
  if (!anchorSelectors.length) {
    return "";
  }

  const baseSelectors = anchorSelectors.join(",\n      ");

  const hoverSelectors = dedupe([
    ...anchorSelectors.map((s) => `${s}:hover`),
    ...anchorSelectors.map((s) => `${s}:focus`),
    ...anchorSelectors.map((s) => `${s}:focus-visible`),
    ...parentSelectors.map((s) => `${s}:hover > a`),
    ...parentSelectors.map((s) => `${s}:focus-within > a`),
  ]).join(",\n      ");

  const activeSelectors = dedupe([
    ...anchorSelectors.map((s) => `${s}.active`),
    ...anchorSelectors.map((s) => `${s}[aria-current="page"]`),
    ...anchorSelectors.map((s) => `${s}[aria-selected="true"]`),
    ...parentSelectors.map((s) => `${s}.active > a`),
    ...parentSelectors.map((s) => `${s}[aria-current="page"] > a`),
    ...parentSelectors.map((s) => `${s}[aria-selected="true"] > a`),
  ]).join(",\n      ");

  let css = `
      ${baseSelectors} {
        background-color: ${color} !important;
        border: 1px solid ${color} !important;
        color: #fff !important;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.35rem 0.75rem;
        border-radius: 999px;
        text-decoration: none !important;
        transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
      }
  `;

  if (hoverSelectors) {
    css += `
      ${hoverSelectors} {
        background-color: ${color} !important;
        border-color: ${color} !important;
        color: #fff !important;
        text-decoration: none !important;
      }
    `;
  }

  if (activeSelectors) {
    css += `
      ${activeSelectors} {
        box-shadow: 0 0 0 2px ${outlineColor},
                    0 0 0 4px rgba(0, 0, 0, 0.08);
      }
    `;
  }

  return css;
}

let navObserver;
let observeTimeout;

function observeNavigation() {
  if (observeTimeout) {
    clearTimeout(observeTimeout);
    observeTimeout = null;
  }

  if (typeof MutationObserver === "undefined") {
    return;
  }

  const targets = Array.from(
    document.querySelectorAll("#navigation-bar, .category-navigation .nav-pills, .kanban-nav")
  );

  if (!targets.length) {
    observeTimeout = setTimeout(observeNavigation, 300);
    return;
  }

  if (navObserver) {
    navObserver.disconnect();
  }

  navObserver = new MutationObserver(() => {
    requestAnimationFrame(updateStyles);
  });

  targets.forEach((el) => {
    navObserver.observe(el, { childList: true, subtree: true, attributes: true });
  });
}

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

  const outlineColor = settings.active_outline_color || "rgba(255,255,255,0.85)";

  tag.textContent = rules
    .map(({ selector, color }) => buildCssBlock(selector, color, outlineColor))
    .filter(Boolean)
    .join("\n");
}

function updateStyles() {
  if (!document.body) {
    return;
  }
  injectStyles();
  observeNavigation();
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
});