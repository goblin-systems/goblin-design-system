# Goblin Design System — Backlog

Priority: **P1** ship-blocking for app adoption · **P2** expected by consumers · **P3** nice to have

---

## Inputs & Controls

### P1 — Primary Button Variant

Only `secondary-btn` exists. Every confirm action in Prompt Goblin and Vision Goblin improvises a primary button with inline styles or `modal-btn-accept`. Add a `.primary-btn` class with `--accent` fill, white text, and hover/active/disabled/focus states that mirror `secondary-btn`. Also add a `.danger-btn` standalone class (currently `.danger` only works inside modal footer).

**Acceptance:** `.primary-btn`, `.danger-btn` classes rendered in demo; both support `.slim-btn` modifier; disabled state greys out with `pointer-events: none`.

### P1 — Switch / Toggle

Binary on/off control visually distinct from a checkbox. Both apps have boolean settings (e.g. "auto-correct", "snap to grid") where a toggle is more intuitive. Needs a `.switch` container with a `.switch-track` and `.switch-thumb`, animated slide via `--duration-fast`. JS: `bindSwitch(options)` returning `{ getValue, setValue, destroy }`. Must set `role="switch"` and `aria-checked`.

**Markup:**
```html
<label class="switch">
  <input type="checkbox" />
  <span class="switch-track"><span class="switch-thumb"></span></span>
  <span class="switch-label">Auto-correct</span>
</label>
```

**Acceptance:** Three states rendered in demo (off, on, disabled). Keyboard toggle via Space. ARIA `role="switch"` and `aria-checked` managed by JS.

### P1 — Tooltip

The highest-frequency missing primitive. Icon buttons, status dots, and truncated labels across both apps need hover/focus explanations. Implement via `data-tooltip="text"` attribute + CSS `::after` pseudo-element positioning. JS: `bindTooltips(root)` for dynamic content and delayed show/hide. Placement: top (default), bottom, left, right via `data-tooltip-placement`.

**Acceptance:** Tooltip renders on hover after 400ms delay, on focus immediately. Arrow points to anchor. Respects viewport edges (flip). Rendered in demo on icon buttons and status indicators.

### P2 — Button Group

Connected segmented buttons sharing a single border outline. Needed for mutually-exclusive option selectors (e.g. view mode, alignment). CSS-only: `.btn-group` removes inner border-radius on adjacent children and collapses shared borders.

**Markup:**
```html
<div class="btn-group">
  <button class="secondary-btn is-active">List</button>
  <button class="secondary-btn">Grid</button>
  <button class="secondary-btn">Canvas</button>
</div>
```

**Acceptance:** Adjacent buttons visually merge. `.is-active` highlights one. Works with both `secondary-btn` and `primary-btn`.

### P2 — Toggle Button Group

Extends Button Group with multi-select semantics. Identical CSS. JS: `bindToggleGroup(options)` managing `is-active` on click, returning `{ getSelected, setSelected, destroy }`. Sets `aria-pressed` on each button.

**Acceptance:** Multiple buttons can be `.is-active` simultaneously. Keyboard activation via Enter/Space.

### P2 — Text / Ghost Button Variant

Low-emphasis button with no background, no border, text-only with hover highlight. Needed for cancel/dismiss actions that shouldn't compete with primary. Class: `.text-btn`. Inherits font sizing from context.

**Acceptance:** Demo shows `.text-btn` inline with a `.primary-btn` in a modal footer and standalone.

### P2 — Custom Select Dropdown

Native `<select>` lacks search, grouping, icons, and multi-select. Build a `.custom-select` using a trigger button + a positioned `.custom-select-list` with `.custom-select-option` items. JS: `bindSelect(options)` returning `{ getValue, setValue, open, close, destroy }`. Supports `grouped: true` with `.custom-select-group` + `.custom-select-group-label`. Sets `role="listbox"`, `aria-expanded`, `aria-activedescendant`.

**Acceptance:** Searchable single-select rendered in demo. Option with leading icon rendered. Keyboard navigation (arrows, Enter, Escape, type-ahead). Falls back gracefully when JS unavailable (hidden native `<select>` synced).

### P3 — Transfer List

Two side-by-side `.compact-list` panels with move buttons between them. Needed for column visibility and category ordering in Vision Goblin. JS: `bindTransferList(options)` returning `{ getLeft, getRight, destroy }`.

**Acceptance:** Items can be moved individually or in batch. Keyboard-accessible move buttons.

### P3 — Rating

Row of star/dot icons for rating input. CSS: `.rating` container, `.rating-star` items. JS: `bindRating(options)` returning `{ getValue, setValue, destroy }`. Sets `aria-valuenow` and `aria-valuetext`.

**Acceptance:** 5-star rating in demo. Hover preview. Half-star optional. Read-only mode.

---

## Feedback & Status

### P1 — Inline Alert

Toast handles transient messages. There is no component for persistent inline feedback inside panels (validation errors, warnings, info callouts). Needs `.alert` container with `.alert-icon`, `.alert-message`, and optional `.alert-dismiss` button. Variants: `.alert-info`, `.alert-success`, `.alert-warning`, `.alert-error`. Uses corresponding `--success`, `--warning`, `--error`, `--accent` tokens for border-left accent stripe.

**Markup:**
```html
<div class="alert alert-warning">
  <span class="alert-icon"><i data-lucide="alert-triangle"></i></span>
  <span class="alert-message">Provider key expires in 3 days.</span>
  <button class="alert-dismiss icon-btn icon-btn-sm"><i data-lucide="x"></i></button>
</div>
```

**Acceptance:** All four variants rendered in demo. Dismiss button removes element. Without JS, dismiss button is simply hidden via CSS.

### P1 — Progress Bar (Linear)

Determinate and indeterminate variants for file operations and loading sequences. CSS: `.progress-bar` container, `.progress-fill` child. Determinate mode uses `style="--progress: 65%"`. Indeterminate mode uses `.progress-bar.indeterminate` with a CSS `@keyframes` shimmer animation. Respects `--duration-slow` and `prefers-reduced-motion`.

**Markup:**
```html
<div class="progress-bar" style="--progress: 65%">
  <div class="progress-fill"></div>
</div>
<div class="progress-bar indeterminate">
  <div class="progress-fill"></div>
</div>
```

**Acceptance:** Determinate bar at 0%, 50%, 100% plus indeterminate animation rendered in demo. Reduced-motion query stops animation.

### P2 — Spinner / Circular Loader

Small indeterminate circular animation. Needed inside buttons during async actions and as standalone section loaders. CSS-only: `.spinner` with `sm` / `md` / `lg` size modifiers. Uses `@keyframes` rotation. Color inherits from `currentColor` by default, accent variant via `.spinner-accent`.

**Markup:**
```html
<span class="spinner spinner-sm"></span>
<button class="primary-btn"><span class="spinner spinner-sm"></span> Saving…</button>
```

**Acceptance:** Three sizes in demo. Inline inside a button. Respects `prefers-reduced-motion` (reduces to opacity pulse).

### P2 — Skeleton

Content loading placeholder. Rectangle, text-line, and circle shape variants with shimmer animation. CSS-only: `.skeleton`, `.skeleton-text`, `.skeleton-circle`. Shimmer uses `background-size` animation on a gradient.

**Markup:**
```html
<div class="skeleton" style="width: 200px; height: 120px"></div>
<div class="skeleton-text" style="width: 80%"></div>
<div class="skeleton-circle" style="--size: 32px"></div>
```

**Acceptance:** Card-sized skeleton, three text lines, and a circle rendered in demo. Shimmer animates. Reduced-motion falls back to static placeholder.

### P2 — Warning Badge Variant

`--warning` token exists but `.badge.warning` class is missing. Add it using `--warning` for text color and a `--badge-warning-bg` / `--badge-warning-border` token pair consistent with the existing badge palette across all three themes.

**Acceptance:** `.badge.warning` rendered alongside existing badge variants in demo.

### P3 — Toast with Inline Action

Extends `showToast` with an optional `action` parameter: `{ label: string, onClick: () => void }`. Renders a clickable label inside the toast. Needed for undo/retry workflows.

**Acceptance:** Demo shows a toast with "Undo" action. Clicking action fires callback and dismisses toast.

---

## Data Display

### P1 — Table

Row/column data layout with header, body, optional footer. CSS: `.table` on `<table>`, automatic styling of `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`. Row hover highlight. Compact variant `.table-compact` reduces padding. Sortable column header: `.table-sortable` on `<th>` with `.sort-asc` / `.sort-desc` indicators. JS: optional `bindTable(options)` for sort-state toggling, returning `{ getSort, destroy }`.

**Markup:**
```html
<table class="table">
  <thead>
    <tr>
      <th class="table-sortable sort-asc">Name</th>
      <th class="table-sortable">Size</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>File.png</td><td>2.4 MB</td><td>…</td></tr>
  </tbody>
</table>
```

**Acceptance:** Table with 3+ columns and 5+ rows in demo. Header sort toggles between asc/desc/none. Row hover state. Compact variant shown.

### P2 — Chip / Tag

Inline removable or selectable token. Needed for multi-value fields (selected models, active filters, applied tags). CSS: `.chip` with optional `.chip-remove` button. Variants: `.chip-default`, `.chip-accent`. Selectable mode: `.chip.is-selected`. JS: optional `onRemove` callback.

**Markup:**
```html
<span class="chip">
  <span>gpt-4o</span>
  <button class="chip-remove"><i data-lucide="x"></i></button>
</span>
<span class="chip chip-accent is-selected">Active</span>
```

**Acceptance:** Removable chip, selectable chip, and disabled chip in demo. Remove button fires callback. Keyboard: Backspace on focused chip triggers remove.

### P2 — Popover

Anchored floating content panel, richer than tooltip, lighter than modal. Needed for inline help, detail previews, and command palettes. Reuses surface tokens (`--bg-section`, `--shadow-modal`). JS: `bindPopover(options)` with `anchor`, `content` (element or render function), `placement`, `trigger` (click | hover), returning `{ open, close, destroy }`. Closes on outside click and Escape. Sets `aria-expanded` on trigger.

**Acceptance:** Click-triggered popover with form content and hover-triggered popover with text content in demo. Flips placement when near viewport edge.

### P2 — Rich List

Extension of `.compact-list` supporting leading icon/avatar, primary + secondary text, trailing action, and dividers. CSS: `.list`, `.list-item`, `.list-item-icon`, `.list-item-text`, `.list-item-secondary`, `.list-item-action`, `.list-divider`. Hover and selected (`.is-selected`) states.

**Markup:**
```html
<ul class="list">
  <li class="list-item">
    <span class="list-item-icon"><i data-lucide="file"></i></span>
    <span class="list-item-text">
      <span>Document.txt</span>
      <span class="list-item-secondary">Modified 2 hours ago</span>
    </span>
    <button class="list-item-action icon-btn icon-btn-sm"><i data-lucide="trash-2"></i></button>
  </li>
  <li class="list-divider"></li>
</ul>
```

**Acceptance:** List with 5+ items, icons, secondary text, and trailing actions in demo. Selected state shown. Divider separating groups.

### P2 — Divider (Standalone)

`nav-divider` only works inside navigation. Add a standalone `.divider` class for horizontal separators and `.divider-vertical` for inline vertical separators. Uses `--border` color. Supports `.divider-label` for centered text labels.

**Markup:**
```html
<hr class="divider" />
<div class="divider"><span class="divider-label">or</span></div>
```

**Acceptance:** Horizontal, vertical, and labeled divider in demo.

### P3 — Avatar

Circular image or initials container. Sizes: `.avatar-sm` (24px), `.avatar-md` (32px), `.avatar-lg` (48px). Falls back to initials on missing image. CSS-only; image set via `background-image` or `<img>` child.

**Markup:**
```html
<span class="avatar avatar-md">
  <img src="..." alt="User" />
</span>
<span class="avatar avatar-md">SP</span>
```

**Acceptance:** Image avatar, initials avatar, and all three sizes in demo. Fallback initials use `--accent` background.

### P3 — Tree View

Hierarchically nested expandable list. Needed for file trees and nested config in Vision Goblin. CSS: `.tree`, `.tree-item`, `.tree-branch`, `.tree-leaf`, `.tree-toggle`. JS: `bindTree(options)` returning `{ expand, collapse, expandAll, collapseAll, destroy }`. Indentation via `padding-left` scaled by depth level.

**Acceptance:** Three-level nested tree with expand/collapse toggles in demo. Keyboard: arrow keys navigate, Enter toggles, asterisk expands all siblings.

---

## Navigation

### P1 — Breadcrumbs

Hierarchical location trail. Needed for nested panel navigation in both apps. CSS-only: `.breadcrumbs` container, `.breadcrumb-item` items, `.breadcrumb-separator` auto-inserted via CSS `::before`. Current item uses `aria-current="page"` and bold text.

**Markup:**
```html
<nav class="breadcrumbs" aria-label="Breadcrumb">
  <a class="breadcrumb-item" href="#">Settings</a>
  <span class="breadcrumb-item" aria-current="page">Audio</span>
</nav>
```

**Acceptance:** Three-level breadcrumb with last item non-linked and bolded in demo. Separator character configurable via `--breadcrumb-separator` custom property (default `"/"`).

### P2 — Stepper

Linear multi-step sequence indicator. Steps have states: pending, active, complete, error. Needed for onboarding and setup flows. CSS: `.stepper`, `.step`, `.step-indicator`, `.step-label`. States via `.step-complete`, `.step-active`, `.step-error`. JS: `bindStepper(options)` returning `{ setStep, getStep, destroy }`.

**Markup:**
```html
<div class="stepper">
  <div class="step step-complete">
    <span class="step-indicator">1</span>
    <span class="step-label">Provider</span>
  </div>
  <div class="step step-active">
    <span class="step-indicator">2</span>
    <span class="step-label">Model</span>
  </div>
  <div class="step">
    <span class="step-indicator">3</span>
    <span class="step-label">Test</span>
  </div>
</div>
```

**Acceptance:** Horizontal stepper with 4 steps showing all states in demo. Active step highlighted with `--accent`. Complete steps show checkmark icon.

### P2 — Drawer / Slide-in Panel

Overlay panel that slides in from screen edge. Needed for detail views and property sheets without a full modal. Reuses `modal-backdrop` for overlay. CSS: `.drawer`, `.drawer-left`, `.drawer-right`. Width controlled via `--drawer-width` (default 320px). JS: `openDrawer(options)` / `closeDrawer(options)` mirroring modal API. Adds `body.drawer-open`. Focus-trapped.

**Acceptance:** Left and right drawer in demo. Slides in with `--duration-base` transition. Closes on backdrop click and Escape. Body scroll locked.

### P2 — Pagination

Page navigation control. Needed for log views and long lists. CSS: `.pagination`, `.page-btn`, `.page-btn.is-active`, `.page-ellipsis`. JS: `bindPagination(options)` with `totalPages`, `currentPage`, `onChange`, returning `{ setPage, destroy }`.

**Markup:**
```html
<nav class="pagination" aria-label="Pagination">
  <button class="page-btn" aria-label="Previous"><i data-lucide="chevron-left"></i></button>
  <button class="page-btn is-active">1</button>
  <button class="page-btn">2</button>
  <span class="page-ellipsis">…</span>
  <button class="page-btn">10</button>
  <button class="page-btn" aria-label="Next"><i data-lucide="chevron-right"></i></button>
</nav>
```

**Acceptance:** Pagination with 10+ pages, ellipsis, prev/next in demo. Active page highlighted. `aria-current="page"` set on active.

### P3 — Context Menu

Positioned floating menu triggered by right-click or arbitrary anchor. Reuses `.nav-option` and `.nav-dropdown` markup. JS: `bindContextMenu(options)` with `target` (element or selector), `items` (array of menu item configs), returning `{ open, close, destroy }`. Positions relative to pointer event, flips at viewport edges.

**Acceptance:** Right-click context menu on a list item in demo. Supports icons, labels, shortcuts, dividers, and disabled items. Closes on outside click and Escape.

---

## Layout & Surfaces

### P1 — Generic Card

`stat-card` and `modal-card` are too specific. Add a general-purpose `.card` base with composable `.card-header`, `.card-body`, `.card-footer` sections. Uses `--bg-section`, `--border`, `--shadow-card`. Supports `.card-compact` for reduced padding.

**Markup:**
```html
<div class="card">
  <div class="card-header">
    <h3>Title</h3>
    <button class="icon-btn icon-btn-sm"><i data-lucide="more-horizontal"></i></button>
  </div>
  <div class="card-body">Content here.</div>
  <div class="card-footer">
    <button class="text-btn">Cancel</button>
    <button class="primary-btn slim-btn">Save</button>
  </div>
</div>
```

**Acceptance:** Card with header/body/footer, card without header, and compact card rendered in demo.

### P2 — Accordion / Collapsible

Expandable/collapsible sections. Needed for grouped settings panels in both apps. CSS: `.accordion`, `.accordion-item`, `.accordion-trigger`, `.accordion-panel`. Open state via `.is-open` on item with animated `max-height` transition. JS: `bindAccordion(options)` with `multiple` flag (default false = only one open), returning `{ open, close, toggle, destroy }`.

**Markup:**
```html
<div class="accordion">
  <div class="accordion-item is-open">
    <button class="accordion-trigger">
      <span>Audio Settings</span>
      <i data-lucide="chevron-down"></i>
    </button>
    <div class="accordion-panel">Panel content…</div>
  </div>
</div>
```

**Acceptance:** Accordion with 3 items in demo. Single-expand and multi-expand modes. Chevron rotates on open. Keyboard: Enter/Space toggles, arrow keys navigate between triggers.

### P2 — Stack / Flow Utilities

Production-safe spacing utility classes. `demo-row` and `demo-grid` are demo-only. Add `.stack` (vertical) and `.row` (horizontal) with gap modifiers `.gap-1` through `.gap-6` mapped to `--space-*` tokens. Add `.align-start`, `.align-center`, `.align-end`, `.justify-between`.

**Acceptance:** Stack and row layouts with different gaps demonstrated. Used internally to simplify at least one existing demo section.

### P3 — Responsive Breakpoint Tokens

Breakpoints exist at 1100px and 760px inside `components.css` but are not exposed as reusable tokens. Extract into named custom media queries or document as token constants. Add utility classes `.hide-below-md`, `.hide-above-md` for responsive visibility.

**Acceptance:** Documented breakpoint values. Utility classes toggling visibility at each breakpoint.

---

## Accessibility

### P1 — ARIA Management for Tabs

`bindTabs` toggles `.is-active` only. It must also set `role="tablist"` on the container, `role="tab"` + `aria-selected` on triggers, `role="tabpanel"` + `aria-labelledby` on panels, and manage `tabindex` (active tab = 0, others = -1). Keyboard: arrow keys move between tabs, Home/End jump to first/last.

**Acceptance:** Screen reader announces "Tab 2 of 4, selected" on focus. Arrow keys cycle. DOM inspector shows correct roles and aria attributes.

### P1 — Focus Trap for Modal

`openModal` and `confirmModal` do not trap focus. Tabbing cycles behind the backdrop. Add a `trapFocus(container)` utility that constrains Tab/Shift+Tab to focusable children. Apply automatically inside `openModal` and `confirmModal`. Release on close.

**Acceptance:** With modal open, Tab from last focusable element wraps to first. Shift+Tab from first wraps to last. Verified with keyboard-only navigation.

### P2 — Keyboard Navigation for Navigation Bar

`bindNavigation` opens dropdowns on click and closes on outside click, but does not support keyboard traversal. Add: arrow-down opens dropdown and focuses first item, arrow keys move between items, Enter activates, Escape closes and returns focus to trigger, right-arrow opens submenu, left-arrow closes submenu.

**Acceptance:** Full menu traversal possible without mouse. Focus returns to trigger on Escape.

### P2 — Accessible Search Combobox

`bindSearch` does not set combobox ARIA. Add `role="combobox"` on input, `aria-expanded` reflecting suggestion visibility, `aria-autocomplete="list"`, `aria-controls` pointing to suggestion list, `role="listbox"` on suggestion container, `role="option"` on items, `aria-activedescendant` tracking highlighted item.

**Acceptance:** Screen reader announces "Combobox, expanded, 3 results" when suggestions open. Highlighted item announced on arrow-key navigation.

### P2 — prefers-reduced-motion

Waveform animation, toast slide-in, modal backdrop fade, skeleton shimmer, and any future spinners/progress bars should respect `prefers-reduced-motion: reduce`. Add a global `@media (prefers-reduced-motion: reduce)` block that sets `--duration-fast`, `--duration-base`, `--duration-slow` to `0.01s` and disables `@keyframes` animations.

**Acceptance:** Enabling reduced-motion in OS settings eliminates all animations. UI remains fully functional.

### P3 — Screen Reader Toast Announcement

`showToast` targets `role="status"` (polite). Error toasts should use `role="alert"` (assertive) so screen readers interrupt. Ensure the `aria-live` region exists in the DOM at mount time, not injected dynamically (dynamic injection misses the first announcement).

**Acceptance:** Error toast interrupts screen reader. Info/success toasts wait for pause in speech.

### P3 — Skip Navigation Link

Visually hidden link that appears on first Tab keypress, jumping focus past window chrome to `<main>` content. Class: `.skip-link`, visible only on `:focus`.

**Acceptance:** First Tab press on page reveals "Skip to content" link. Activating it moves focus to main content area.

---

## Tokens & Foundations

### P2 — Elevation / Shadow Scale

Replace ad-hoc `--shadow-card`, `--shadow-modal`, `--shadow-toast` with a formal scale: `--elevation-1` (subtle), `--elevation-2` (card), `--elevation-3` (dropdown/popover), `--elevation-4` (modal/drawer), `--elevation-5` (toast/overlay). Existing shadow tokens become aliases for backward compatibility.

**Acceptance:** Token override panel (or demo section) shows all five elevation levels. Existing components unchanged.

### P2 — Z-Index Token Scale

Toasts, modals, tooltips, drawers, popovers, and overlays each stack at different layers. Without a formal scale, consuming apps will hit z-index conflicts. Define: `--z-dropdown: 100`, `--z-drawer: 200`, `--z-modal: 300`, `--z-toast: 400`, `--z-tooltip: 500`, `--z-overlay: 600`. Apply to existing components.

**Acceptance:** Modal over drawer, tooltip over modal, toast over everything verified in demo.

### P3 — Icon Size Tokens

Icon sizes are controlled ad-hoc through `icon-btn-sm/md/lg` fixed pixel values. Expose `--icon-size-sm` (14px), `--icon-size-md` (18px), `--icon-size-lg` (22px) tokens. Icon button classes reference these tokens. Consuming apps can override to adjust icon density globally.

**Acceptance:** Overriding `--icon-size-md` in `:root` changes all medium icon buttons.

### P3 — Focus Ring Token

Focus rings are hardcoded per-component. Centralize into `--focus-ring` (e.g. `0 0 0 2px var(--border-focus)`) so consuming apps can override ring style, width, and color in one place.

**Acceptance:** Setting `--focus-ring` on `:root` updates all interactive elements.

---

## Demo App

### P2 — Interactive Controls Demo Page

A dedicated demo section where every JS-bound component (tabs, search, range, radial, modal, navigation, and all new behavioral components) can be exercised live. Each component gets its own card with controls for toggling states, changing options, and viewing events.

**Acceptance:** Every `bind*` function has a live interactive demo. Events logged to a visible console.

### P2 — Accessibility Audit Section

A demo section that lets developers verify tab order, focus rings, ARIA labels, and screen-reader announcements for all interactive components. Includes a "keyboard-only mode" toggle that hides the cursor.

**Acceptance:** Section lists every component with its ARIA roles and keyboard shortcuts. Tab order visualized.

### P3 — Token Override Panel

Live controls panel that lets developers override key tokens (`--accent`, `--bg`, `--border`, `--text`, `--font-size-base`) and see all components update in real time. Complements the existing theme switcher.

**Acceptance:** Changing `--accent` via a color input updates all accent-colored elements live.

### P3 — Copy-to-clipboard Markup Snippets

Each component in the demo shows a "Copy markup" button that writes the minimal HTML pattern to the clipboard. Reduces onboarding friction for consuming apps.

**Acceptance:** Clicking copy on any component demo copies valid HTML to clipboard. Confirmation toast shown.
