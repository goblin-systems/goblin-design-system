# @goblin-systems/goblin-design-system

Dark, sharp-edged design system for desktop apps. Built with TypeScript and CSS custom properties — no framework required. Optimised for Tauri.

- Zero runtime framework dependencies
- Full TypeScript API with headless behaviour modules
- 1,900+ Lucide icons included
- CSS custom property token system
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

// 3. After any HTML containing <i data-lucide="..."> is in the DOM:
applyIcons();
```

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
