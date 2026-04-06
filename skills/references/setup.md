# Setup

## Install

```bash
npm install @goblin-systems/goblin-design-system lucide
```

- `lucide` is a required peer dependency.
- `@tauri-apps/api` is optional and only needed for the Tauri window helpers.

## Minimal Bootstrap

```ts
import "@goblin-systems/goblin-design-system/style.css";

import {
  applyIcons,
  applyTheme,
  bindNavigation,
  bindSearch,
  bindTabs,
  bindTooltips,
  showToast,
} from "@goblin-systems/goblin-design-system";

applyTheme("goblin");
bindTabs();
bindNavigation();
bindTooltips();

applyIcons();
showToast("Ready", "success");
```

Call `applyIcons()` again after any HTML with `<i data-lucide="...">` is injected into the DOM.

Theme switching also works without JS by setting `data-theme` on any ancestor element. Omitting `data-theme` uses the default `goblin` theme.

## Design Rules

- Built-in themes: `goblin`, `dark`, `light`
- Square corners only — never introduce `border-radius`
- Vanilla TS/JS only — no framework dependencies
- CSS classes provide appearance; TypeScript functions provide behaviour
- Visual values come from CSS custom properties and `data-theme` token overrides
- Use CSS custom properties instead of hardcoded colours when extending
