/* global settings, api */

const STYLE_ID = "nav-button-color-overrides";

function parseRules() {
  const lines = settings.nav_button_color_pairs || [];
  return lines
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
        background-color: ${color};
        border: 1px solid ${color};
        color: #fff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.35rem 0.75rem;
        border-radius: 999px;
        transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
      }
      ${selector}:hover,
      ${selector}:focus {
        background-color: ${color};
        border-color: ${color};
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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    updateStyles();
    api.onPageChange(() => requestAnimationFrame(updateStyles));
    if (typeof api.onAppEvent === "function") {
      api.onAppEvent("theme-settings:changed", updateStyles);
    }
  });
} else {
  updateStyles();
  api.onPageChange(() => requestAnimationFrame(updateStyles));
  if (typeof api.onAppEvent === "function") {
    api.onAppEvent("theme-settings:changed", updateStyles);
  }
}
