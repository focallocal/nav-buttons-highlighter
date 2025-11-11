# Nav Buttons Highlighter

A Discourse theme component that styles selected category navigation buttons and keeps the filter pills visible on mobile.

## Features

- Centered mobile nav pills with tool icons stacked beneath.
- Configurable list of buttons to highlight with custom colours.
- Active-state outline that plays nicely with Discourse’s underline.

## Installation

1. In the Discourse Admin console, go to **Customize → Themes → Components** and click **Install**.
2. Choose **From a Git repository** and paste:
   ```
   https://github.com/focallocal/nav-buttons-highlighter
   ```
3. Once installed, add the component to any themes you want the styling applied to.

## Configuration

Inside the component’s **Settings** tab:

- **nav_button_color_pairs** – Simple list of entries in the format `selector | #hex`. You can add up to six entries. Example:
  ```
  li[data-filter="docs"] > a | #87CEEB
  li[data-filter="tasks"] > a | #20B2AA
  ```
  To find the selector, open your forum in a browser, right-click the navigation pill you want to target, select **Inspect**, and copy the CSS path displayed for the link element.

- **active_outline_color** – Colour applied as a subtle outline when a highlighted pill is active.

Save your changes and refresh a category page to see the effect.

## Development

This repository contains:

- `common/common.scss` – Layout adjustments (mobile centring, pill sizing).
- `common/head/script.js` – Injects dynamic styles from the settings list.
- `about.json` – Component metadata for Discourse.
- `settings.yml` – Declares admin-facing settings.

To iterate locally, edit the files and then upload or point your Discourse instance at your fork.

## License

MIT © Public Happiness Movement
