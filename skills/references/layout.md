# Layout

## Split Pane (Resizable Workspace)

### API

```ts
import {
  bindSplitPaneResize,
  type SplitPaneOptions,
} from "@goblin-systems/goblin-design-system";

bindSplitPaneResize({
  workspace: document.getElementById("workspace")!,
  leftResizer: document.getElementById("left-pane-resizer")!,
  rightResizer: document.getElementById("right-pane-resizer")!,
  leftVar: "--left-panel-width",
  rightVar: "--right-panel-width",
  minLeft: 160,
  maxLeft: 480,
  minRight: 160,
  maxRight: 520,
});
```

### Markup

```html
<div id="workspace" class="editor-workspace">
  <aside class="editor-tools-pane">...</aside>
  <div id="left-pane-resizer" class="pane-resizer"></div>
  <main class="editor-canvas-pane">...</main>
  <div id="right-pane-resizer" class="pane-resizer"></div>
  <aside class="editor-sidebar-pane">...</aside>
</div>
```

Classes: `editor-workspace`, `editor-tools-pane`, `editor-canvas-pane`, `editor-sidebar-pane`, `pane-resizer`, `left-collapsed`, `right-collapsed`

Width variables: `--left-panel-width`, `--right-panel-width`

---

## Scroll Panel

Fixed-height scrollable container with styled scrollbars.

```html
<div class="scroll-panel scroll-panel-lg">...</div>

<!-- Custom height -->
<div class="scroll-panel" style="--scroll-panel-height: 400px">...</div>
```

Modifiers: `scroll-panel-sm`, `scroll-panel-md`, `scroll-panel-lg`, `scroll-panel-xl`

---

## Settings Section & Mini Panel

Common surfaces for settings and content areas.

```html
<div class="settings-section">
  <div class="section-heading-row">
    <h2>Section title</h2>
    <div class="toolbar-actions"><!-- buttons --></div>
  </div>
  <p class="hint">Helpful text</p>
  <span class="kbd">Ctrl+S</span>
</div>

<div class="mini-panel">...</div>
```

Classes: `settings-section`, `mini-panel`, `section-heading-row`, `toolbar-actions`, `hint`, `kbd`

---

## Stack & Row Utilities

```html
<div class="stack gap-4">...</div>
<div class="row gap-3">...</div>
```

Classes:

- `stack` — `flex-direction: column`
- `row` — `flex-direction: row`, `align-items: center`
- `gap-1` through `gap-6`
- `align-start`, `align-center`, `align-end`
- `justify-between`, `justify-end`

---

## Status Bar

```html
<div class="editor-status-bar">...</div>
```

---

## Compact List & Stack Actions

```html
<ul class="compact-list">
  <li>Item</li>
</ul>

<div class="stack-actions">...</div>
```

---

## Demo Helpers (dev/demo pages only)

Not for production use:

`demo-section`, `demo-row`, `demo-grid`, `demo-swatch-grid`, `demo-swatch`, `demo-radius-strip`, `demo-radius-box`, `demo-type-scale`, `demo-type-row`, `demo-type-label`, `icon-gallery-cell`
