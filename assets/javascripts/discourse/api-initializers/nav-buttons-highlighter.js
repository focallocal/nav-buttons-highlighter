import { apiInitializer } from "discourse/lib/api";
import { helperContext } from "discourse-common/lib/helpers";

export default apiInitializer("1.14.0", (api) => {
  const settings = helperContext()?.themeSettings;
  
  if (!settings) {
    console.error("[Nav Buttons Highlighter] Theme settings not available");
    return;
  }

  console.log("[Nav Buttons Highlighter] Settings loaded:", {
    pairs: settings.nav_button_color_pairs,
    outline: settings.active_outline_color
  });

  function applyStyles() {
    const colorPairs = settings.nav_button_color_pairs || [];
    const outlineColor = settings.active_outline_color || "rgba(255,255,255,0.85)";

    console.log("[Nav Buttons Highlighter] Applying styles for", colorPairs.length, "selectors");

    if (!colorPairs.length) {
      console.warn("[Nav Buttons Highlighter] No color pairs configured");
      return;
    }

    let cssRules = colorPairs.map(({ selector, color }) => {
      return `
        ${selector} {
          background-color: ${color} !important;
          color: #fff !important;
          padding: 8px 16px !important;
          border-radius: 8px !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
        }
        ${selector}:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        ${selector}.active {
          outline: 2px solid ${outlineColor} !important;
          outline-offset: 2px !important;
          font-weight: 600 !important;
        }
      `;
    }).join('\n');

    // Remove old style tag if exists
    const oldStyle = document.getElementById('nav-buttons-highlighter-styles');
    if (oldStyle) {
      oldStyle.remove();
    }

    // Inject new styles
    const styleTag = document.createElement('style');
    styleTag.id = 'nav-buttons-highlighter-styles';
    styleTag.textContent = cssRules;
    document.head.appendChild(styleTag);

    console.log("[Nav Buttons Highlighter] Styles injected");
  }

  function forceNavVisibility() {
    // Target the actual navigation container
    const navBar = document.querySelector('#navigation-bar');
    if (!navBar) {
      console.warn("[Nav Buttons Highlighter] Navigation bar not found");
      return;
    }

    console.log("[Nav Buttons Highlighter] Forcing navigation visibility");

    // Make all list items visible
    const items = navBar.querySelectorAll('li');
    items.forEach(item => {
      item.style.display = 'inline-flex';
      item.style.visibility = 'visible';
      item.style.opacity = '1';
    });

    // Hide any dropdown buttons
    document.querySelectorAll('[data-identifier="navigation-menu"]').forEach(btn => {
      btn.style.display = 'none';
    });
  }

  // Apply on page load and navigation changes
  api.onPageChange(() => {
    requestAnimationFrame(() => {
      applyStyles();
      forceNavVisibility();
    });
  });
});