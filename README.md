# @goblin-systems/goblin-design-system

Dark, sharp-edged design system for desktop apps. Built with vanilla TypeScript and CSS custom properties — no framework required. Optimised for Tauri apps but usable anywhere.

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
  openModal,
  confirmModal,
  bindSplitPaneResize,
  setupWindowControls,
} from "@goblin-systems/goblin-design-system";

// 3. After any HTML containing <i data-lucide="..."> is in the DOM:
applyIcons();
```

---

## Components

| Component | CSS class(es) | TS function |
|---|---|---|
| Button | `secondary-btn` | — |
| Icon button | `icon-btn`, `icon-btn-sm/md/lg` | — |
| Tabs | `top-tab`, `document-tab` | `bindTabs` |
| Modal | `modal-backdrop`, `modal-card` | `openModal`, `confirmModal` |
| Toast | `app-toast` | `showToast` |
| Navigation | `nav-bar`, `nav-item`, `nav-dropdown` | `bindNavigation` |
| Search field | `search-field` | `bindSearch` |
| Double range | `range-slider` | `bindRange` |
| Split pane | `split-workspace` | `bindSplitPaneResize` |
| Scroll panel | `scroll-panel` | — |
| Status indicator | `status-indicator` | — |
| Badge | `badge` | — |
| Waveform | — | `drawWaveform` |

See [`skills/SKILL.md`](skills/SKILL.md) for full markup patterns and API signatures.

---

## Overriding tokens

All visual properties are CSS custom properties. Override them after importing the stylesheet:

```css
:root {
  --accent: #00b4d8;
  --bg: #0a0a0a;
}
```

Full token list: [`src/lib/tokens.css`](src/lib/tokens.css)

---

## Installing the Claude Code skill

The `skills/SKILL.md` file is a ready-to-use Claude Code skill that gives Claude full knowledge of every component, CSS class, and TypeScript API in this design system.

**Project skill** (applies to one repo):

```bash
mkdir -p .claude/commands
cp node_modules/@goblin-systems/goblin-design-system/skills/SKILL.md .claude/commands/goblin-ds.md
```

**Global skill** (available in all your projects):

```bash
mkdir -p ~/.claude/commands
cp node_modules/@goblin-systems/goblin-design-system/skills/SKILL.md ~/.claude/commands/goblin-ds.md
```

Then in any Claude Code session, invoke it with:

```
/goblin-ds
```

Claude will have full context on components, markup patterns, design tokens, and TypeScript APIs for the duration of that conversation.

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

---

## CI / Release

| Workflow | Trigger | What it does |
|---|---|---|
| CI | push / PR to `master` | type-check + build library |
| Release | manual dispatch | bump version (patch/minor/major), publish to npm, create GitHub release |

The release workflow requires an `NPM_TOKEN` secret set in GitHub repository settings (Settings → Secrets and variables → Actions).

---

## Licence

MIT
