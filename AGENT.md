# Goblin Design System — Agent Guide

This file is for AI agents working on the `goblin-design-system` repository itself.
For guidance on *using* the library in another project, see `skills/SKILL.md`.

---

## What this repo is

Two things in one:

1. **A publishable npm library** (`@goblin-systems/goblin-design-system`) — the `src/lib/` tree. Contains CSS design tokens, component styles, and headless TypeScript behaviour modules.
2. **A live demo app** — `index.html` + `src/main.ts`, built with Vite and run inside a Tauri frameless desktop window. The demo exists only to showcase every component in-browser; it does not ship in the npm package.

---

## Repository layout

```
src/
  lib/                    ← everything that ships in the npm package
    tokens.css            ← all CSS custom properties (the single source of truth)
    base.css              ← global reset, scrollbar, input base styles
    components.css        ← all component class definitions
    index.ts              ← barrel export (imports CSS + re-exports all TS)
    icons/
      index.ts            ← lucide icon set, applyIcons(), createIcon()
    headless/
      dom.ts              ← byId, qs, qsAll, populateSelectOptions helpers
      modal.ts            ← openModal, closeModal, bindModal, confirmModal
      navigation.ts       ← bindNavigation (dropdown nav with submenus)
      range.ts            ← bindRange (double-handle range slider)
      search.ts           ← bindSearch (debounced search + autocomplete)
      split-pane.ts       ← bindSplitPaneResize (drag-resizable panels)
      tabs.ts             ← bindTabs (tab switching)
      toast.ts            ← showToast, mountToast
    platform/
      tauri-window.ts     ← setupWindowControls, setupContextMenuGuard
    waveform/
      waveform.ts         ← drawWaveform, cycle helpers, color schemes
  main.ts                 ← demo app entry (not in npm package)
index.html                ← demo app shell (not in npm package)
overlay.html              ← Tauri overlay window (not in npm package)
vite.config.ts            ← demo app build (multi-entry Tauri)
vite.lib.config.ts        ← library build (ESM + CJS + types + CSS)
tsconfig.lib.json         ← separate tsconfig for declaration emit
```

---

## Design principles

- **Dark theme only.** All colours reference CSS custom properties from `tokens.css`. Never hardcode colours.
- **Square corners everywhere.** No `border-radius` anywhere — not in CSS, not inline. The design uses `0` for all radii. If you need to add rounding, the user will ask explicitly.
- **No framework.** Pure vanilla TypeScript + DOM. No React, Vue, Svelte.
- **Headless pattern.** Behaviour lives in TypeScript; appearance lives in CSS. A headless module accepts a DOM element (already in the page) and attaches event listeners. It does not create DOM except `confirmModal` which is self-contained by design.
- **CSS custom properties for everything.** Spacing, colour, typography, shadows all use `var(--...)` tokens. Never use magic numbers.

---

## Adding a new component

### 1. CSS (always required)

Add a clearly-labelled block to `src/lib/components.css`:

```css
/* ── MyComponent ─────────────────────────────────────────────────────────────── */
.my-component { ... }
.my-component-foo { ... }
```

Use existing tokens (`var(--accent)`, `var(--border)`, `var(--text-muted)`, etc.).
Never add `border-radius`.

### 2. TypeScript module (if the component has behaviour)

Create `src/lib/headless/my-component.ts`. Follow this pattern:

```typescript
export interface MyComponentOptions {
  el: HTMLElement;
  onChange?: (value: unknown) => void;
}
export interface MyComponentHandle {
  setValue(v: unknown): void;
  destroy(): void;
}
export function bindMyComponent(options: MyComponentOptions): MyComponentHandle { ... }
```

- Accept the root element, not IDs.
- Return a handle with at minimum a `destroy()` method.
- Keep all DOM queries scoped to `options.el` — never query `document` except for global keyboard/click listeners, and clean those up in `destroy()`.

### 3. Barrel export

Add to `src/lib/index.ts`:

```typescript
export { bindMyComponent } from "./headless/my-component";
export type { MyComponentOptions, MyComponentHandle } from "./headless/my-component";
```

### 4. Demo

Add a `<div class="settings-section">` block to the appropriate tab in `index.html` and wire it up in `src/main.ts`. The demo is the visual spec — if it doesn't look right in the demo, the CSS is wrong.

---

## CSS naming conventions

| Pattern | Used for |
|---|---|
| `.component-name` | Root element |
| `.component-name-part` | Child element |
| `.component-name--modifier` | State/variant modifier |
| `.is-open`, `.is-active`, `.is-dragging` | JS-toggled state classes |

---

## Build commands

```bash
bun run dev          # start Tauri dev server
bun run build        # build demo app (Vite, for Tauri)
bun run build:lib    # type-check + build npm package → dist/
bun run lint         # tsc --noEmit type check
```

The lib build outputs:
- `dist/index.js` — ESM
- `dist/index.cjs` — CommonJS
- `dist/index.d.ts` — TypeScript declarations
- `dist/style.css` — all CSS bundled

---

## What NOT to do

- Do not touch `src/main.ts` or `index.html` for library changes — those are demo only.
- Do not add `border-radius` to any new CSS.
- Do not import from `lucide` individually in component code — use `ICON_SET` and `applyIcons()` / `createIcon()`.
- Do not add Tauri-specific code outside `src/lib/platform/tauri-window.ts`.
- Do not commit `dist/` — it is built by CI.
- Do not use `document.getElementById` inside headless modules; accept elements as parameters.

---

## Key tokens quick-reference

```
--bg / --bg-section / --bg-input / --bg-deep   surfaces
--border / --border-focus                       borders
--text / --text-muted / --text-heading          text hierarchy
--accent / --accent-hover                       primary purple
--success / --warning / --error                 semantic colours
--font / --font-mono                            typefaces
--font-size-xs … --font-size-2xl               10px – 16px
--space-1 … --space-10                          4px – 32px
--duration-fast / --duration-base / --duration-slow
--shadow-card / --shadow-modal / --shadow-toast
```
