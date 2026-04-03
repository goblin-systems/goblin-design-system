# @goblin-systems/goblin-design-system

Sharp-edged desktop UI primitives for vanilla TypeScript apps. The package ships CSS tokens, component classes, built-in `goblin` / `dark` / `light` themes, and headless DOM helpers for the interactive pieces.

- No framework runtime
- Square visual language driven by CSS custom properties
- Lucide-backed icon helpers
- Headless TypeScript bindings for navigation, overlays, inputs, data display, and layout
- Optional Tauri helpers for frameless window chrome

## Installation

```bash
npm install @goblin-systems/goblin-design-system lucide
```

- `lucide` is a required peer dependency.
- `@tauri-apps/api` is an optional peer dependency used only by `setupWindowControls()` and `setupContextMenuGuard()`.

## Quick start

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

// After any HTML containing <i data-lucide="..."> is in the DOM:
applyIcons();

showToast("Ready", "success");
```

Built-in theme switching also works without JavaScript:

```html
<html data-theme="light">
  <!-- app -->
</html>
```

If `data-theme` is omitted, the package defaults to `goblin`.

## Themes and tokens

```ts
import {
  BUILTIN_THEMES,
  THEME_LABELS,
  applyTheme,
  getTheme,
  isBuiltinTheme,
  setTheme,
  type BuiltinTheme,
} from "@goblin-systems/goblin-design-system";

const nextTheme: BuiltinTheme = "dark";

if (isBuiltinTheme(nextTheme)) {
  setTheme(nextTheme);
}

console.log(getTheme(), BUILTIN_THEMES, THEME_LABELS);
```

To add an app-specific theme, scope token overrides with `data-theme` after importing `style.css`:

```css
@import "@goblin-systems/goblin-design-system/style.css";

[data-theme="my-theme"] {
  --bg: #101418;
  --bg-section: #161c22;
  --bg-input: #0e1318;
  --bg-deep: #090d10;
  --border: #27303a;
  --border-focus: #4aa3ff;
  --text: #d7dde5;
  --text-muted: #8f98a3;
  --text-heading: #ffffff;
  --text-subtle: #a9d5ff;
  --accent: #4aa3ff;
  --accent-hover: #6bb3ff;
  --success: #43c27a;
  --warning: #caa64a;
  --error: #dd6666;
}
```

## Public API overview

Core exports from `src/lib/index.ts` are grouped as follows:

- Icons: `applyIcons`, `createIcon`, `ICON_SET`, `IconNode`
- DOM helpers: `byId`, `byIdOptional`, `qs`, `qsAll`, `populateSelectOptions`, `setGroupDisabled`
- Themes: `BUILTIN_THEMES`, `THEME_LABELS`, `applyTheme`, `getTheme`, `isBuiltinTheme`, `isUiTheme`, `setTheme`
- Navigation and discovery: `bindTabs`, `bindNavigation`, `bindSearch`, `bindTooltips`, `bindPopover`, `bindContextMenu`
- Feedback and overlays: `mountToast`, `showToast`, `openModal`, `closeModal`, `bindModal`, `confirmModal`, `openDrawer`, `closeDrawer`
- Inputs and selection: `bindRange`, `bindRadial`, `bindSwitch`, `bindAccordion`, `bindPagination`, `bindStepper`, `bindToggleGroup`, `bindSelect`, `bindTransferList`, `bindRating`, `bindTree`
- Data and layout: `bindTable`, `bindSplitPaneResize`
- Platform and media: `setupWindowControls`, `setupContextMenuGuard`, `drawWaveform`, `createWaveProgressGradient`, waveform style/color helpers

Every headless export is fully typed and keeps markup ownership with the consumer. For the full class list, markup patterns, behavior notes, and type names, see `skills/SKILL.md`.

## Consumer guidance

- Import `style.css` exactly once.
- Use the documented class names and markup structure; bindings expect specific child elements for controls like range, radial, select, accordion, tree, and transfer list.
- Call `applyIcons()` after rendering icon placeholders.
- Prefer token overrides and `data-theme` over selector-specific restyling.
- The system is intentionally square; do not add rounded corners when extending it.

## Skill documentation

This repo includes the consumer-facing Skill in `skills/SKILL.md`.

```bash
npx skills add goblin-systems/goblin-design-system
```

Or from a local checkout:

```bash
npx skills add .
```

## Demo and build commands

```bash
npm install
npm run dev
npm run build
npm run build:lib
```

- `npm run build` builds the demo app.
- `npm run build:lib` type-checks the library entry and emits the publishable package into `dist/`.
