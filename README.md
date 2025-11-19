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

### Finding the CSS File

**There is NO admin settings panel for this component** - all customization is done by editing the CSS file directly in your repository.

**The CSS file is located at:**
```
common/common.scss
```

**How to edit it:**

**Option 1: Edit in GitHub** (easiest)
1. Fork a version of this repository and install
2. Navigate to `common/common.scss`
3. Click the pencil icon to edit
4. Make your changes and commit
5. In Discourse Admin → Customize → Components, click "Check for Updates" on the Nav Buttons Highlighter component

**Option 2: Edit locally**
1. Clone the repository to your computer
2. Edit `common/common.scss` in any text editor
3. Commit and push your changes
4. In Discourse Admin → Customize → Components, click "Check for Updates"

**Notes:**
- This component works on ALL themes where it's enabled (not tied to a specific theme)
- The CSS file has detailed inline comments explaining exactly what to change
- Changes require updating the component in Discourse admin after editing

**The CSS file comments explain:**
- Which selector to change (e.g., `a.kanban-nav`) to highlight different links
- Which color values to update for different colors
- How to add/remove mobile dropdown highlighting

### Common Customisations

#### Change Color from Blue to Green

The button uses three shades of blue to create a gradient effect:
- **Light blue**: `#5ca3ff` (top of gradient)
- **Medium blue**: `#4285F4` (middle of gradient)  
- **Dark blue**: `#3a75e4` (bottom/shadow)

To change to green, find and replace these values in `common/common.scss`:

| Current Blue | Replace With Green |
|--------------|-------------------|
| `#5ca3ff` | `#5cb860` |
| `#4285F4` | `#4CAF50` |
| `#3a75e4` | `#45a049` |
| `rgba(66, 133, 244` | `rgba(76, 175, 80` |

#### Highlighting a Different Navigation Link

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

#### Highlighting Links Inside the Mobile Dropdown

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