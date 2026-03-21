You are helping build UI using the **Goblin Design System** (`@goblin-systems/goblin-design-system`).

## Setup

```ts
// main entry
import { applyIcons, showToast, bindTabs, /* etc */ } from "@goblin-systems/goblin-design-system";
// styles (import once in your app entry)
import "@goblin-systems/goblin-design-system/style.css";
```

After injecting any HTML that contains `<i data-lucide="...">` icons, call `applyIcons()`.

---

## Design constraints

- **Dark theme only** — all colours from CSS custom properties
- **No border-radius** — all corners are square by design
- **Vanilla TS/JS only** — no framework required; all behaviour is DOM-based
- **Headless pattern** — CSS classes handle appearance; TypeScript functions handle behaviour

---

## CSS classes reference

### Buttons

```html
<button class="secondary-btn">Label</button>
<button class="secondary-btn" disabled>Disabled</button>

<!-- Icon buttons -->
<button class="icon-btn"><i data-lucide="search"></i></button>
<button class="icon-btn icon-btn-sm">…</button>   <!-- 26px -->
<button class="icon-btn icon-btn-md">…</button>   <!-- 32px -->
<button class="icon-btn icon-btn-lg">…</button>   <!-- 40px -->
```

Active/selected state on any button: add `is-active` class.

### Tabs

```html
<!-- Top-level tabs -->
<div data-tab-group="my-group">
  <button class="top-tab is-active" data-tab-trigger="panel-a">Tab A</button>
  <button class="top-tab" data-tab-trigger="panel-b">Tab B</button>
</div>
<div data-tab-panel="panel-a">…content…</div>
<div data-tab-panel="panel-b" hidden>…content…</div>

<!-- Document-style tabs -->
<button class="document-tab is-active" data-tab-trigger="doc-1">doc-1</button>
```

```ts
import { bindTabs } from "@goblin-systems/goblin-design-system";
bindTabs({ root: document });
```

### Modal

```html
<!-- Static markup modal -->
<div id="my-modal" class="modal-backdrop" hidden>
  <div class="modal-card">
    <div class="modal-header">
      <h3>Title</h3>
      <button class="icon-btn modal-close-btn modal-btn-reject" aria-label="Close">
        <i data-lucide="x"></i>
      </button>
    </div>
    <p class="modal-body-text">Body text here.</p>
    <div class="modal-footer">
      <button class="secondary-btn modal-btn-reject">Cancel</button>
      <button class="modal-btn-accept">Confirm</button>
      <!-- danger variant: -->
      <button class="modal-btn-accept danger">Delete</button>
    </div>
  </div>
</div>
```

```ts
import { openModal, closeModal, confirmModal } from "@goblin-systems/goblin-design-system";

// Static modal with callbacks
openModal({
  backdrop: document.getElementById("my-modal")!,
  onAccept: () => console.log("accepted"),
  onReject: () => console.log("rejected"),
});

// Programmatic confirm — returns Promise<boolean>
const ok = await confirmModal({
  title: "Delete item?",
  message: "This cannot be undone.",
  acceptLabel: "Delete",
  variant: "danger",   // "default" | "danger"
});
```

### Toast

```html
<!-- Place once in body -->
<div id="app-toast" class="app-toast" role="status" aria-live="polite"></div>
```

```ts
import { showToast } from "@goblin-systems/goblin-design-system";
showToast("Saved.", "success");           // "success" | "error" | "info"
showToast("Oops.", "error", 4000);        // custom duration ms
```

### Navigation (dropdown nav bar)

```html
<nav id="my-nav" class="nav-bar">
  <div class="nav-item">
    <button class="nav-trigger">File <i data-lucide="chevron-down"></i></button>
    <div class="nav-dropdown">
      <button class="nav-option" data-nav-id="new">New</button>
      <div class="nav-divider"></div>
      <!-- Submenu: use div, NOT button, for the parent -->
      <div class="nav-option nav-option--has-sub">
        <span class="nav-option-icon"><i data-lucide="upload"></i></span>
        <span class="nav-option-label">Export As</span>
        <span class="nav-option-arrow"><i data-lucide="chevron-right"></i></span>
        <div class="nav-submenu">
          <button class="nav-option" data-nav-id="export-png">PNG</button>
          <button class="nav-option" data-nav-id="export-svg">SVG</button>
        </div>
      </div>
      <!-- Disabled option -->
      <button class="nav-option nav-option--disabled" data-nav-id="save">Save</button>
    </div>
  </div>
</nav>
```

**Important:** `.nav-option--has-sub` must be a `<div>`, not a `<button>` — browsers disallow nested buttons, which would break submenu rendering.

```ts
import { bindNavigation } from "@goblin-systems/goblin-design-system";
const nav = bindNavigation({
  root: document.getElementById("my-nav") ?? document,
  onSelect: (id) => console.log("selected:", id),
});
// nav.closeAll(), nav.openItem(el), nav.closeItem(el)
```

### Search field

```html
<div class="search-field" style="width:280px">
  <span class="search-field-icon"><i data-lucide="search"></i></span>
  <input id="my-search" type="text" placeholder="Search…" />
  <div class="search-suggestions"></div>  <!-- omit if no autocomplete needed -->
</div>
```

```ts
import { bindSearch } from "@goblin-systems/goblin-design-system";
const search = bindSearch({
  input: document.getElementById("my-search") as HTMLInputElement,
  debounce: 200,
  onSearch: (query) => {
    const results = myData.filter(x => x.includes(query));
    search.setSuggestions(results);   // populates the dropdown
  },
  onSelect: (value) => console.log("picked:", value),
});
```

### Range slider (double handle)

```html
<div id="my-range" class="range-slider">
  <div class="range-track">
    <div class="range-fill"></div>
    <!-- For inverted range, also add: -->
    <!-- <div class="range-fill-end"></div> -->
    <div class="range-thumb" data-thumb="lo"></div>
    <div class="range-thumb" data-thumb="hi"></div>
  </div>
  <div class="range-labels">                    <!-- optional -->
    <span class="range-label-lo"></span>
    <span class="range-label-hi"></span>
  </div>
</div>
```

```ts
import { bindRange } from "@goblin-systems/goblin-design-system";
const range = bindRange({
  el: document.getElementById("my-range")!,
  min: 0, max: 100, step: 1,
  value: [20, 80],
  inverted: false,  // true = fill outside the handles (exclusion zone)
  onChange: (lo, hi) => console.log(lo, hi),
});
range.setValue(30, 70);
range.getValue(); // [30, 70]
```

### Single range

Native `<input type="range">` is fully styled. To animate the track fill, update a CSS variable:

```ts
function syncFill(input: HTMLInputElement) {
  const pct = ((+input.value - +input.min) / (+input.max - +input.min)) * 100;
  input.style.setProperty("--_pct", `${pct}%`);
}
const input = document.querySelector("input[type=range]") as HTMLInputElement;
syncFill(input);
input.addEventListener("input", () => syncFill(input));
```

### Split pane

```html
<div id="workspace" class="split-workspace">
  <div class="split-pane split-pane-left">…</div>
  <div id="left-resizer" class="split-resizer"></div>
  <div class="split-pane split-pane-main">…</div>
  <div id="right-resizer" class="split-resizer"></div>
  <div class="split-pane split-pane-right">…</div>
</div>
```

```ts
import { bindSplitPaneResize } from "@goblin-systems/goblin-design-system";
bindSplitPaneResize({
  workspace: document.getElementById("workspace")!,
  leftResizer: document.getElementById("left-resizer")!,
  rightResizer: document.getElementById("right-resizer")!,
});
// Collapse panels by toggling classes:
workspace.classList.toggle("left-collapsed");
workspace.classList.toggle("right-collapsed");
```

### Scroll panel

CSS-only. Constrains height and applies custom scrollbar:

```html
<div class="scroll-panel scroll-panel-lg">
  <!-- any content -->
</div>
```

Size modifiers: `scroll-panel-sm` (200px) · `scroll-panel-md` (360px) · `scroll-panel-lg` (520px) · `scroll-panel-xl` (680px)

Custom height: `style="--scroll-panel-height: 400px"`

### Status indicator

```html
<span class="status-indicator connected">
  <span></span>
  <span>Connected</span>
</span>
<!-- States: connected | untested | disconnected | error -->
```

### Badges

```html
<span class="badge default">Stable</span>
<span class="badge beta">Beta</span>
```

### Form elements

All styled automatically from `base.css`:

```html
<input type="text" placeholder="…" />
<input type="password" />
<input type="number" />
<select><option>…</option></select>
<input type="checkbox" />
<input type="radio" name="g" />
<input type="range" min="0" max="100" value="50" />
```

Group label + input:

```html
<div class="field-block">
  <label>Field label</label>
  <input type="text" />
</div>
```

### Layout helpers

```html
<div class="settings-section">   <!-- padded card section -->
  <h2>Section title</h2>
  …
</div>
<div class="demo-row">           <!-- flex row with gap -->…</div>
<div class="demo-grid">          <!-- 2-col responsive grid -->…</div>
```

---

## Icons

1,900+ Lucide icons available. Use `data-lucide` attribute, then call `applyIcons()`:

```html
<i data-lucide="search"></i>
<i data-lucide="chevron-right"></i>
<i data-lucide="trash-2"></i>
```

```ts
import { applyIcons, createIcon } from "@goblin-systems/goblin-design-system";
applyIcons();                        // replace all <i data-lucide> in DOM
const svg = createIcon("search");    // create single SVGElement programmatically
```

---

## Tauri window controls (optional)

Only needed in Tauri apps:

```html
<button id="window-minimize-btn" class="icon-btn"><i data-lucide="minus"></i></button>
<button id="window-maximize-btn" class="icon-btn"><i data-lucide="maximize-2"></i></button>
<button id="window-close-btn"    class="icon-btn"><i data-lucide="x"></i></button>
```

```ts
import { setupWindowControls, setupContextMenuGuard } from "@goblin-systems/goblin-design-system";
setupWindowControls();       // wires the three buttons above
setupContextMenuGuard();     // disables right-click context menu
```

---

## Design tokens

Override in your own `:root` after importing the stylesheet.

```css
:root {
  /* Surfaces */
  --bg: #0d1324;          --bg-section: #16213e;
  --bg-input: #0f1729;    --bg-deep: #0b1020;
  /* Borders */
  --border: #2a2a4a;      --border-focus: #6c63ff;
  /* Text */
  --text: #e0e0e0;        --text-muted: #8888aa;
  --text-heading: #fff;   --text-subtle: #b8b8d4;
  /* Semantic */
  --accent: #6c63ff;      --accent-hover: #7c73ff;
  --success: #4ade80;     --warning: #fbbf24;   --error: #f87171;
  /* Typography */
  --font: "Segoe UI", -apple-system, sans-serif;
  --font-mono: "Cascadia Code", "Fira Code", monospace;
  /* Spacing: --space-1 (4px) … --space-10 (32px) */
  /* Animation: --duration-fast / --duration-base / --duration-slow */
}
```
