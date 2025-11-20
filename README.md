# Nav Buttons Highlighter

A Discourse theme component that highlights navigation buttons to guide users toward specific paths or functions you want them to follow, and makes the mobile dropdown menu more clear and visible.

## Purpose

This component helps you:
- **Guide users** by highlighting important navigation links (e.g., your task board, documentation, or key categories)
- **Improve mobile UX** by making the dropdown navigation button stand out
- **Create visual hierarchy** in your navigation bar

## Features

- 3D button styling with gradients, shadows, and hover effects
- Mobile-responsive - highlights the "Latest" dropdown toggle button on mobile so users are more clear they can/should click it
- Pre-configured for Discourse Kanban plugin by default
- CSS-only implementation - reliable and lightweight
- Easy to customize

## Default Configuration

By default, this component is set up to highlight the **Discourse Kanban** plugin ([link](https://meta.discourse.org/t/kanban-board/)) in **BLUE**. However, it can easily be changed to highlight any navigation link you choose in any colour.

## Installation

1. In the Discourse Admin console, go to **Customize → Themes → Components** and click **Install**
2. Copy from Git repository link and paste:
   ```
   https://github.com/focallocal/nav-buttons-highlighter
   ```
3. Once installed, add the component to your active theme.

## How to Customize

### Admin Settings Panel

All configuration is done through simple admin settings - no CSS editing required!

**To configure:**

1. Go to **Admin → Customize → Themes**
2. Click on your active theme
3. Find **Nav Buttons Highlighter** in the Included Components section
4. Click **Settings**

**Available Settings:**

**Button 1 - Kanban (Default):**
- **Highlight Kanban**: Toggle on/off (default: on)
- **Kanban Color**: Color picker for gradient (default: green #4CAF50)
- **Kanban Selector**: CSS selector (default: `a.kanban-nav`)

**Button 2 - Custom:**
- **Highlight Button 2**: Enable second button
- **Button 2 Color**: Color picker (default: blue #2196F3)
- **Button 2 Selector**: Enter your CSS selector (e.g., `a[href='/page']`)

**Button 3 - Custom:**
- **Highlight Button 3**: Enable third button
- **Button 3 Color**: Color picker (default: orange #FF5722)
- **Button 3 Selector**: Enter your CSS selector

**Mobile:**
- **Highlight Mobile Dropdown**: Toggle mobile Latest dropdown (default: on)
- **Mobile Dropdown Color**: Color picker (default: green #4CAF50)

**Finding CSS Selectors:**

To highlight different navigation links, you need their CSS selector:

1. Open your forum in a browser
2. Right-click the link you want to highlight
3. Select "Inspect Element"
4. Look for the `<a>` tag and note:
   - Class names: `class="kanban-nav"` → use: `a.kanban-nav`
   - Href value: `href="/c/support"` → use: `a[href="/c/support"]`

**Common Examples:**
- Kanban plugin: `a.kanban-nav`
- Support category: `a[href="/c/support"]`
- Documentation tag: `a[href="/tags/documentation"]`
- Custom page: `a[href="/my-page"]`
- Second nav button: `#navigation-bar > li:nth-child(2) > a`

**Color Selection:**

Use hex color codes (e.g., `#4285F4` for blue). The component automatically generates:
- Lighter shade for top of gradient
- Darker shade for bottom/shadow
- Hover and active state colors

**Popular Colors:**
- Blue: `#4285F4` (default)
- Green: `#4CAF50`
- Red: `#F44336`
- Orange: `#FF9800`
- Purple: `#9C27B0`

### Stable CSS-Only Version

If you prefer direct CSS editing, the previous version (2.0.1) is available:

**Install the CSS-only version:**
```
https://github.com/focallocal/nav-buttons-highlighter/tree/stable-v2.0.1
```

See that branch's README for CSS editing instructions.

## Development

This repository contains:
- `common/common.scss` — All button styling and detailed customization guide
- `assets/javascripts/discourse/api-initializers/nav-buttons-highlighter.js` — Minimal initializer (required for Discourse)
- `about.json` — Component metadata

## Troubleshooting

**Q: Changes aren't appearing**  
A: After editing, click "Save" and hard-refresh your forum page (Ctrl+F5 or Cmd+Shift+R).

**Q: I want to highlight multiple buttons**  
A: Copy the entire button CSS block and paste it underneath the existing CSS rule, then change the selector and optionally the colors.

## License

MIT — Public Happiness Movement