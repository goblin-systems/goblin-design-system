# @goblin-systems/goblin-design-system

Sharp-edged design system for desktop apps. Ships built-in `goblin`, `dark`, and `light` themes with TypeScript helpers and a CSS custom property contract. No framework required. Optimised for Tauri.

- Zero runtime framework dependencies
- Full TypeScript API with headless behaviour modules
- 1,900+ Lucide icons included
- Built-in `goblin`, `dark`, and `light` themes in one `style.css`
- CSS custom property token system for app and theme extension
- Tauri window control utilities (optional)

---

## Installation

```bash
npm install @goblin-systems/goblin-design-system lucide
# or
bun add @goblin-systems/goblin-design-system lucide
```

`lucide` is a required peer dependency.

---

## Quick start

```ts
// 1. Import styles once in your app entry
import "@goblin-systems/goblin-design-system/style.css";

// 2. Import what you need
import {
  applyIcons,
  applyTheme,
  showToast,
  bindTabs,
  bindNavigation,
  bindSearch,
  bindRange,
  bindRadial,
  openModal,
  confirmModal,
  bindSplitPaneResize,
  setupWindowControls,
} from "@goblin-systems/goblin-design-system";

// 3. Optional: switch the built-in theme
applyTheme("dark");

// 4. After any HTML containing <i data-lucide="..."> is in the DOM:
applyIcons();
```

You can also switch themes without JavaScript:

```html
<html data-theme="light">
  <!-- app -->
</html>
```

Goblin remains the default theme, so omitting `data-theme` is equivalent to `goblin`.

## Themes

Built-in themes are exported as `goblin`, `dark`, and `light`.

```ts
import {
  BUILTIN_THEMES,
  THEME_LABELS,
  applyTheme,
  getTheme,
  isBuiltinTheme,
  type BuiltinTheme,
} from "@goblin-systems/goblin-design-system";

const nextTheme: BuiltinTheme = "light";

if (isBuiltinTheme(nextTheme)) {
  applyTheme(nextTheme);
}

console.log(getTheme());
console.log(BUILTIN_THEMES, THEME_LABELS);
```

To add a custom app theme, set `data-theme` on a parent element and override the design-system tokens after importing `style.css`:

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

Most component visuals now inherit from theme tokens, so consumers should not need selector-level override hacks for built-in theme switching.

---

## Documentation

Documentation is provided as a Skill
---

## Installing the skill

This repo includes a standard skill in `skills/SKILL.md`.

Install it with:

```bash
npx skills add goblin-systems/goblin-design-system
```

Or from a local checkout:

```bash
npx skills add .
```

---

## Running the demo app

The repository includes a live demo Tauri app that showcases every component.

```bash
git clone https://github.com/goblin-systems/goblin-design-system
cd goblin-design-system
bun install
bun run dev         # start Vite dev server
bun run tauri dev   # launch Tauri window (requires Rust toolchain)
```

---

## Building the library

```bash
bun run build:lib   # outputs to dist/
bun run lint        # TypeScript type check
```
