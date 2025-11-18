# Nav Buttons Highlighter

A Discourse theme component that highlights navigation buttons to guide users toward specific paths or functions you want them to follow, and makes the mobile dropdown menu more clear and visible.

## Purpose

This component helps you:
- **Guide users** by highlighting important navigation links (e.g., your task board, documentation, or key categories)
- **Improve mobile UX** by making the dropdown navigation button stand out
- **Create visual hierarchy** in your navigation bar

## Features

-  Beautiful 3D button styling with gradients, shadows, and hover effects
-  Mobile-responsive - highlights the "Latest" dropdown toggle button on mobile
-  Pre-configured for Discourse Kanban plugin by default
-  CSS-only implementation - reliable and lightweight
-  Easy to customize - detailed instructions included

## Default Configuration

By default, this component is set up to highlight the **Discourse Kanban** plugin ([learn more](https://meta.discourse.org/t/kanban-board/)) in **BLUE**. However, it can easily be changed to highlight any navigation link you choose.

## Installation

1. In the Discourse Admin console, go to **Customize  Themes  Components** and click **Install**.
2. Choose **From a Git repository** and paste:
   ```
   https://github.com/focallocal/nav-buttons-highlighter
   ```
3. Once installed, add the component to your active theme.

## How to Customize

### Finding the CSS Editor

**There is NO admin settings panel for this component** - all customization is done by editing the CSS file:

1. Go to **Admin  Customize  Themes**
2. Click on **Nav Buttons Highlighter**
3. Look for the **Common** tab in the horizontal menu near the top\r\n4. Click on **Common**\r\n5. The CSS editor will open showing `common.scss` with detailed customization instructions

### Common Customizations

#### Change Color from Blue to Green

Find and replace these color values in the CSS:

**BLUE (current default):**
- `#4285F4`  `#4CAF50`
- `#5ca3ff`  `#5cb860`
- `#3a75e4`  `#45a049`
- `rgba(66, 133, 244`  `rgba(76, 175, 80`

#### Highlight a Different Button

Replace the selector `a.kanban-nav` with your target link:

**Examples:**
- `a[href="/c/category-name"]` - Highlight a specific category
- `a[href="/tags/tag-name"]` - Highlight a specific tag  
- `a[href="/my-custom-page"]` - Highlight any custom link
- `#navigation-bar > li:nth-child(2) > a` - Highlight the 2nd navigation button

**How to find the selector:**
1. Open your forum in a browser
2. Right-click the link you want to highlight
3. Select "Inspect Element"
4. Look for class names (e.g., `class="kanban-nav"`) or href values in the HTML

#### Disable Mobile Dropdown Highlighting

Find the section labeled `/* Latest dropdown button on mobile */` and either:
- Delete the entire section, OR
- Comment it out by wrapping it in `/* ... */`

#### Highlight Links Inside the Mobile Dropdown

Add this CSS block after the existing styles:

```scss
.fk-d-menu-modal a.kanban-nav {
  background: linear-gradient(135deg, #5ca3ff 0%, #4285F4 50%, #3a75e4 100%) !important;
  color: #fff !important;
  padding: 8px 16px !important;
  border-radius: 8px !important;
}
```

Replace `a.kanban-nav` with your desired selector.

## Development

This repository contains:
- `common/common.scss`  All button styling and detailed customization guide
- `assets/javascripts/discourse/api-initializers/nav-buttons-highlighter.js`  Minimal initializer (required for Discourse)
- `about.json`  Component metadata

## Troubleshooting

**Q: I don''t see an "Edit CSS" button**  
A: Look for "Edit CSS/HTML" at the top of the theme page, then click "common" in the CSS section of the left sidebar.

**Q: Changes aren''t appearing**  
A: After editing, click "Save" and hard-refresh your forum page (Ctrl+F5 or Cmd+Shift+R).

**Q: I want to highlight multiple buttons**  
A: Copy the entire button CSS block and paste it below, then change the selector and optionally the colors.

## License

MIT  Public Happiness Movement