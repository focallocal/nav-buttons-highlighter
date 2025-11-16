import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("1.8.0", (api) => {
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

    // Add more specific selectors for better specificity
    const baseSelectors = anchorSelectors.map(s => `body ${s}`).join(",\n      ");

    const hoverSelectors = dedupe([
      ...anchorSelectors.map((s) => `body ${s}:hover`),
      ...anchorSelectors.map((s) => `body ${s}:focus`),
      ...anchorSelectors.map((s) => `body ${s}:focus-visible`),
      ...parentSelectors.map((s) => `body ${s}:hover > a`),
      ...parentSelectors.map((s) => `body ${s}:focus-within > a`),
    ]).join(",\n      ");

    const activeSelectors = dedupe([
      ...anchorSelectors.map((s) => `body ${s}.active`),
      ...anchorSelectors.map((s) => `body ${s}[aria-current="page"]`),
      ...anchorSelectors.map((s) => `body ${s}[aria-selected="true"]`),
      ...parentSelectors.map((s) => `body ${s}.active > a`),
      ...parentSelectors.map((s) => `body ${s}[aria-current="page"] > a`),
      ...parentSelectors.map((s) => `body ${s}[aria-selected="true"] > a`),
    ]).join(",\n      ");

    let css = `
      ${baseSelectors} {
        background-color: ${color} !important;
        border: 1px solid ${color} !important;
        color: #fff !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 0.35rem 0.75rem !important;
        border-radius: 999px !important;
        text-decoration: none !important;
        transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease !important;
        font-weight: 500 !important;
      }
    `;

    if (hoverSelectors) {
      css += `
      ${hoverSelectors} {
        background-color: ${color} !important;
        border-color: ${color} !important;
        color: #fff !important;
        text-decoration: none !important;
        opacity: 0.9 !important;
      }
      `;
    }

    if (activeSelectors) {
      css += `
      ${activeSelectors} {
        box-shadow: 0 0 0 2px ${outlineColor},
                    0 0 0 4px rgba(0, 0, 0, 0.08) !important;
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

  function preventDropdownBehavior() {
    // Force navigation items to be visible on mobile
    const navBar = document.querySelector('#navigation-bar');
    if (!navBar) return;

    // Hide any dropdown toggle buttons and menus
    const dropdownElements = document.querySelectorAll(
      '.list-control-toggle-link-trigger, ' +
      '.fk-d-menu__trigger, ' +
      '.fk-d-menu-modal, ' +
      '.fk-d-menu[data-identifier="navigation-menu"]'
    );
    dropdownElements.forEach(el => {
      el.style.display = 'none';
      el.style.visibility = 'hidden';
      el.style.pointerEvents = 'none';
    });

    // Make sure all list items in navigation are visible
    const listItems = navBar.querySelectorAll('li');
    listItems.forEach(item => {
      // Don't show dropdown trigger items themselves
      if (item.classList.contains('list-control-toggle-link-trigger') || 
          item.querySelector('.fk-d-menu__trigger')) {
        item.style.display = 'none';
      } else {
        // Force navigation items to be visible
        item.style.display = 'inline-flex';
        item.style.visibility = 'visible';
        item.style.opacity = '1';
      }
    });
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
    preventDropdownBehavior();
    observeNavigation();
  }

  // Use the api object provided by apiInitializer
  api.onPageChange(() => {
    requestAnimationFrame(updateStyles);
  });

  // Listen for theme settings changes if available
  if (typeof api.onAppEvent === "function") {
    api.onAppEvent("theme-settings:changed", () => {
      requestAnimationFrame(updateStyles);
    });
  }

  // Initial setup
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      requestAnimationFrame(updateStyles);
    }, { once: true });
  } else {
    requestAnimationFrame(updateStyles);
  }
});