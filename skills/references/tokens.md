# Tokens & Themes

## Theme API

```ts
import {
  BUILTIN_THEMES,
  THEME_LABELS,
  applyTheme,
  getTheme,
  isBuiltinTheme,
  isUiTheme,
  setTheme,
  type ApplyThemeOptions,
  type BuiltinTheme,
  type UiTheme,
} from "@goblin-systems/goblin-design-system";

applyTheme("dark");
setTheme("light");
const current = getTheme();
```

- `BuiltinTheme` / `UiTheme` union: `goblin | dark | light`
- `BUILTIN_THEMES` — ordered built-in theme list
- `THEME_LABELS` — maps theme ids to display labels
- `applyTheme(theme)` is an alias of `setTheme(theme, options?)`
- `setTheme(theme, options?)` sets `data-theme` on `document.documentElement` by default
- `getTheme(target?)` reads `data-theme` and falls back to `goblin`
- `isBuiltinTheme()` and `isUiTheme()` validate unknown values

## CSS-Only Theme Switching

```html
<html data-theme="light"></html>
```

## Core Tokens

`style.css` ships `goblin`, `dark`, and `light` token blocks. `goblin` is the default via `:root`.

```css
:root {
  --bg: #0d1324;
  --bg-section: #16213e;
  --bg-input: #0f1729;
  --bg-deep: #0b1020;

  --border: #2a2a4a;
  --border-focus: #6c63ff;

  --text: #e0e0e0;
  --text-muted: #8888aa;
  --text-heading: #ffffff;
  --text-subtle: #b8b8d4;

  --accent: #6c63ff;
  --accent-hover: #7c73ff;
  --success: #4ade80;
  --warning: #fbbf24;
  --error: #f87171;

  --font: "Segoe UI", -apple-system, sans-serif;
  --font-mono: "Cascadia Code", "Fira Code", monospace;
}
```

## Additional Token Groups

- Font sizes: `--font-size-xs` through `--font-size-2xl`
- Spacing: `--space-1` through `--space-10`
- Durations: `--duration-fast`, `--duration-base`, `--duration-slow`
- Shadows: `--shadow-card`, `--shadow-modal`, `--shadow-toast`
- Component tokens: `--top-tab-active-bg`, `--editor-status-bg`, `--pane-resizer-bg`, `--toast-bg`, `--wave-panel-bg`
- Scrollbar tokens used by global and scroll-panel styles

## Custom App Theme

Override tokens after importing the stylesheet, scoped with `data-theme`:

```css
[data-theme="my-app"] {
  --accent: #ff6b35;
  --bg: #1a1a2e;
}
```
