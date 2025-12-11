# Discourse Theme Component - Best Practices

This document summarizes best practices for developing Discourse theme components, learned from experience and official Discourse documentation.

## Table of Contents
1. [CSS Guidelines](#css-guidelines)
2. [JavaScript Guidelines](#javascript-guidelines)
3. [Component Architecture](#component-architecture)
4. [Testing](#testing)
5. [Pre-Push Checklist](#pre-push-checklist)

---

## CSS Guidelines

### Use CSS Variables for Colors

**Never hardcode colors.** Discourse provides CSS variables that respect dark mode and theme settings.

```scss
// ❌ BAD - Hardcoded colors
.my-button {
  background: #0088cc;
  color: rgba(0, 0, 0, 0.5);
  border: 1px solid #ccc;
}

// ✅ GOOD - CSS Variables
.my-button {
  background: var(--tertiary);
  color: rgb(var(--primary-rgb) / 0.5);
  border: 1px solid var(--primary-low);
}
```

### Available Color Variables

| Variable | Usage |
|----------|-------|
| `--primary` | Main text color |
| `--secondary` | Main background color |
| `--tertiary` | Links, buttons, accents |
| `--danger` | Errors, destructive actions |
| `--success` | Success states |
| `--warning` | Warning states |
| `--highlight` | Highlights, selections |
| `--primary-rgb` | For alpha: `rgb(var(--primary-rgb) / 0.5)` |
| `--secondary-rgb` | For alpha: `rgb(var(--secondary-rgb) / 0.5)` |
| `--primary-low` | Subtle borders, backgrounds |
| `--primary-medium` | Medium emphasis |
| `--primary-high` | High emphasis |

### Use rgb() Not rgba()

Discourse's stylelint enforces modern CSS syntax:

```scss
// ❌ BAD - rgba() rejected by stylelint
background: rgba(0, 0, 0, 0.5);
background: rgba(var(--primary-rgb), 0.5);

// ✅ GOOD - rgb() with slash syntax
background: rgb(0 0 0 / 0.5);
background: rgb(var(--primary-rgb) / 0.5);
```

### BEM Naming Convention

Follow Block Element Modifier naming:

```scss
// Block
.kanban-card { }

// Element (use double underscore)
.kanban-card__header { }
.kanban-card__body { }

// Modifier (use double dash as prefix)
.kanban-card.--dragging { }
.kanban-card.--selected { }

// State classes (use is- or has- prefix)
.kanban-card.is-loading { }
.kanban-card.has-error { }
```

### Nested SCSS

Use nesting for modifiers and states:

```scss
.kanban-card {
  background: var(--secondary);
  
  &__header {
    padding: 0.5rem;
  }
  
  &.--dragging {
    opacity: 0.5;
  }
  
  &.is-loading {
    pointer-events: none;
  }
}
```

---

## JavaScript Guidelines

### Use Glimmer Components (.gjs files)

Widgets are deprecated. Use Glimmer components with `.gjs` extension:

```javascript
// ❌ BAD - Deprecated widget API
api.createWidget("my-widget", { ... });
api.decorateWidget("post:after", ...);

// ✅ GOOD - Glimmer component
// components/my-component.gjs
import Component from "@glimmer/component";

export default class MyComponent extends Component {
  <template>
    <div class="my-component">
      {{@data}}
    </div>
  </template>
}
```

### Plugin Outlets

Use `api.renderInOutlet()` to inject components:

```javascript
// api-initializers/my-plugin.js
import { apiInitializer } from "discourse/lib/api";
import MyComponent from "../components/my-component";

export default apiInitializer("1.0", (api) => {
  api.renderInOutlet("topic-above-posts", MyComponent);
});
```

### Always Include pluginId

When using `modifyClass`, always specify `pluginId`:

```javascript
// ❌ BAD - No pluginId
api.modifyClass("controller:topic", {
  myMethod() { }
});

// ✅ GOOD - With pluginId
api.modifyClass("controller:topic", {
  pluginId: "my-theme-component",
  myMethod() { }
});
```

### Use Ember Modifiers for DOM Interaction

```javascript
// Custom modifier for touch events
const touchDrag = modifier((element, positional, named) => {
  const { onStart, onMove, onEnd } = named;
  
  element.addEventListener("touchstart", onStart);
  element.addEventListener("touchmove", onMove);
  element.addEventListener("touchend", onEnd);
  
  return () => {
    element.removeEventListener("touchstart", onStart);
    element.removeEventListener("touchmove", onMove);
    element.removeEventListener("touchend", onEnd);
  };
});
```

---

## Component Architecture

### File Structure

```
my-theme-component/
├── about.json              # Required: metadata, version
├── settings.yml            # Theme settings
├── common/
│   └── common.scss         # Styles for all platforms
├── desktop/
│   └── desktop.scss        # Desktop-only styles
├── mobile/
│   └── mobile.scss         # Mobile-only styles
├── javascripts/
│   └── discourse/
│       ├── api-initializers/
│       │   └── my-plugin.js
│       └── components/
│           └── my-component.gjs
└── spec/
    └── system/
        └── my_component_spec.rb  # System tests
```

### about.json

```json
{
  "name": "My Theme Component",
  "about_url": "https://github.com/user/repo",
  "license_url": "https://github.com/user/repo/blob/main/LICENSE",
  "minimum_discourse_version": "3.3.0",
  "authors": "Your Name",
  "component": true
}
```

### settings.yml - Use Dropdowns for Categories and Groups

**Don't make admins type slugs manually!** Use `list_type` for category/group pickers:

```yaml
# ❌ BAD - Manual text entry for categories
categories_to_hide:
  type: list
  default: ""
  description: "Enter category slugs separated by commas"

# ✅ GOOD - Category dropdown picker
categories_to_hide:
  type: list
  list_type: category
  default: ""
  description: "Categories to hide from sidebar"

# ✅ GOOD - Group dropdown picker  
groups_allowed:
  type: list
  list_type: group
  default: ""
  description: "Groups this setting applies to"
```

This gives admins a nice searchable dropdown instead of having to look up slugs!

---

## Testing

### Test Selectors

Modal selectors have changed in recent Discourse versions:

```ruby
# ❌ OLD - No longer works
find(".d-modal .btn-primary").click

# ✅ NEW - Current selector
find(".dialog-content .btn-primary").click
```

### Run Tests Locally

```bash
# In discourse directory
bin/rails db:test:prepare
bin/rspec spec/system/my_theme_spec.rb
```

---

## Pre-Push Checklist

Run before every push:

### Automated Checks

```powershell
# Windows - Run the pre-push script
.\pre-push-check.ps1

# With auto-fix
.\pre-push-check.ps1 -Fix
```

```bash
# Unix/Mac - Run linters manually
npx stylelint common/**/*.scss --fix
npx prettier --write .
npx eslint . --fix
```

### Manual Checklist

- [ ] **CSS Variables**: All colors use `var(--variable)`, no hardcoded values
- [ ] **rgb() Format**: Using `rgb(... / alpha)` not `rgba(...)`
- [ ] **BEM Naming**: Classes follow `.block__element.--modifier` pattern
- [ ] **Glimmer Components**: Using `.gjs` files, no deprecated widgets
- [ ] **pluginId**: All `modifyClass` calls include `pluginId`
- [ ] **Settings UX**: Use `list_type: category` or `list_type: group` for dropdowns
- [ ] **Plugin Outlets**: Use `api.renderInOutlet()` instead of overriding templates
- [ ] **Additive CSS**: CSS is additive (overrides), not replacing core styles
- [ ] **Mobile Testing**: Tested on actual mobile device or DevTools
- [ ] **Dark Mode**: Tested with dark theme enabled
- [ ] **Linting Passes**: `npx stylelint`, `npx prettier --check`, `npx eslint`
- [ ] **Squashed Commits**: For PRs, squash to single commit
- [ ] **about.json**: Has `minimum_discourse_version` field

---

## Minimizing Maintenance

Follow these guidelines to reduce maintenance burden when Discourse updates:

### Do's

1. **Use Plugin Outlets** - Inject content via `api.renderInOutlet()` instead of overriding templates
2. **Use Additive CSS** - Override styles, don't replace core stylesheets
3. **Use CSS Variables** - Colors adapt to theme/dark mode automatically
4. **Use Git** - Track changes with version control for easier troubleshooting
5. **Check Official Components** - Look for existing [official themes](https://meta.discourse.org/tags/c/theme/61/none/official) first
6. **Use Text Customization** - For simple text changes, use Admin → Customize → Text

### Don'ts

1. **Don't Override Templates** - Template overrides break with Discourse updates
2. **Don't Override Core JS** - Same issue, breaks with updates
3. **Don't Use Widgets** - Deprecated, use Glimmer components instead
4. **Don't Hardcode Selectors** - Use semantic classes from core where possible

---

## Discourse Developer Tools

### Finding Plugin Outlets

In development mode or by running `enableDevTools()` in browser console:
- Click the 🔌 icon in the developer toolbar
- Green placeholders = simple outlets (add content)
- Blue placeholders = wrapper outlets (replace content)
- Mouseover shows available `@outletArgs`

### Finding CSS Selectors

Instead of hunting through DevTools:
1. Find how core styles an element
2. Base your approach on core's selectors
3. Use additive CSS to override

### Useful Commands

```bash
# Sync theme changes live
discourse_theme watch .

# Install linting configs
pnpm add -D @discourse/lint-configs
```

### Squash Commits for PR

```bash
# Reset to upstream and create single commit
git fetch upstream
git reset --soft upstream/main
git add -A
git commit -m "feat: description of changes"
git push --force origin feature-branch
```

---

## Resources

- [Discourse Developer Guide](https://meta.discourse.org/t/93648) - Main guide (updated Mar 2025)
- [Discourse Theme Tutorial](https://meta.discourse.org/t/357796) - 7-step tutorial series (new!)
- [Theme Structure](https://meta.discourse.org/t/60848) - File structure reference
- [Theme Settings](https://meta.discourse.org/t/82557) - settings.yml types and options
- [CSS Guidelines](https://meta.discourse.org/t/361851) - BEM naming and patterns
- [Core Variables](https://meta.discourse.org/t/77551) - Available CSS variables
- [Minimizing Maintenance](https://meta.discourse.org/t/261388) - Keep themes stable
- [Plugin Outlets](https://meta.discourse.org/t/32727) - How to use outlets
- [@discourse/lint-configs](https://github.com/discourse/lint-configs) - Official linting configs

---

*Last updated December 2025 - Discourse 3.3+ (Glimmer/Ember Octane)*
