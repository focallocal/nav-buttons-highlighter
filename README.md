# Nav Buttons Highlighter

A Discourse theme component that highlights navigation buttons with beautiful 3D styling. Fully CSS-based for reliability and ease of customization.

## Features

-  Beautiful 3D button styling with gradients, shadows, and hover effects
-  Mobile-responsive - highlights the "Latest" dropdown toggle on mobile
-  Highlights the Tasks button (`a.kanban-nav`) by default
-  CSS-only implementation - no JavaScript required
-  Easy to customize - just edit the CSS file

## Installation

1. In the Discourse Admin console, go to **Customize  Themes  Components** and click **Install**.
2. Choose **From a Git repository** and paste:
   ```
   https://github.com/focallocal/nav-buttons-highlighter
   ```
3. Once installed, add the component to your active theme.

## Customization

**This component has NO admin settings** - all customization is done by editing the CSS file directly.

### How to Customize Colors & Buttons

1. Go to **Admin  Customize  Themes**
2. Click on **Nav Buttons Highlighter**
3. Click the **CSS** tab at the top
4. Click **Edit CSS** next to "Common"
5. The file `common/common.scss` will open with detailed instructions in the comments

### Quick Example - Change to Blue

Find the green color values in the CSS and replace with blue:
- Change `#4CAF50`  `#007bff` (main color)
- Change `#5cb860`  `#4da3ff` (light shade)
- Change `#45a049`  `#0056b3` (dark shade)
- Change RGB `76, 175, 80`  `0, 123, 255` (for shadows)

The CSS file contains detailed comments with more examples!

## Direct CSS Edit Link

Once installed, you can access the CSS editor directly at:
```
https://[YOUR-FORUM-URL]/admin/customize/themes/[THEME_ID]/common/scss/edit
```
Replace `[YOUR-FORUM-URL]` with your forum domain and `[THEME_ID]` with the theme ID (visible in your browser URL when viewing the theme).

## Development

This repository contains:
- `common/common.scss`  All button styling and customization
- `assets/javascripts/discourse/api-initializers/nav-buttons-highlighter.js`  Minimal initializer (required for Discourse)
- `about.json`  Component metadata

## License

MIT  Public Happiness Movement
