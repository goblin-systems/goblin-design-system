# Goblin Design System — Backlog

Priority: **P1** ship-blocking · **P2** expected by consumers · **P3** nice to have

---

## Open

### P3 — Command Palette

`mod+k` launcher overlay: full-width search input over a keyboard-navigable results list. JS: `bindCommandPalette(options)` with `items` (or async `onSearch`), `onSelect`, and `hotkey` (default `"mod+k"`). Manages open/close, filtering, keyboard navigation, and focus trap.

```html
<div class="command-palette-backdrop" hidden>
  <div class="command-palette">
    <div class="command-palette-input-wrap">
      <i data-lucide="search"></i>
      <input class="command-palette-input" type="text" placeholder="Search commands…" />
    </div>
    <ul class="command-palette-list"></ul>
  </div>
</div>
```

**Acceptance:** Opens on `mod+k`, closes on Escape or backdrop click. Arrow keys navigate results. Enter selects. Results filter as user types.

---

### P3 — Tour / Spotlight

Step-by-step onboarding overlay. JS: `bindTour(steps)` highlights a target element with a cutout backdrop, shows a popover with title/description/next/skip, advances through steps.

**Acceptance:** Target element highlighted with surrounding backdrop. Popover positioned adjacent to target. Next/prev/skip controls work. Cleans up on finish.

---

### P3 — Virtual List

Performance renderer for large datasets. JS: `bindVirtualList(options)` renders only visible rows, recycling DOM nodes as the user scrolls.

**Acceptance:** 10 000-item list scrolls at 60 fps. Only ~20 DOM rows exist at any time. `itemHeight` and `renderItem` are required options.

---

### P3 — Demo: Copy-to-clipboard Markup Snippets

Each component card in the demo shows a "Copy markup" button that writes the minimal HTML pattern to the clipboard.

**Acceptance:** Clicking copy on any component demo copies valid HTML to clipboard. Confirmation toast shown.

---

## Completed

All items below are implemented and demoed.

### Inputs & Controls
- ✅ **P1** Primary btn / Danger btn / Text btn — `.primary-btn`, `.danger-btn`, `.text-btn`, `.slim-btn`
- ✅ **P1** Switch / Toggle — `bindSwitch`
- ✅ **P1** Tooltip — `bindTooltips` (delegated, portalled, viewport-aware)
- ✅ **P2** Button Group — `.btn-group`
- ✅ **P2** Toggle Group — `bindToggleGroup`
- ✅ **P2** Custom Select — `bindSelect`
- ✅ **P3** Transfer List — `bindTransferList`
- ✅ **P3** Rating — `bindRating`
- ✅ **P1** Number Input — `bindNumberInput`
- ✅ **P2** File Drop Zone — `bindDropZone` (incl. Tauri v2 native OS drop via `onDropPaths`)
- ✅ **P2** Auto-resize Textarea — `bindTextarea`
- ✅ **P2** Date Picker / Date Range Picker — `bindDatePicker`, `bindDateRangePicker`
- ✅ **P2** Multi-select with chips — `bindMultiSelect`
- ✅ **P2** Text Field (floating label + validation) — `bindTextField`
- ✅ **P2** Double Range Slider — `bindRange`
- ✅ **P2** Radial Dial — `bindRadial`

### Feedback & Status
- ✅ **P1** Inline Alert — `bindAlert`
- ✅ **P1** Progress Bar (determinate + indeterminate) — CSS `.progress-bar`
- ✅ **P2** Spinner — CSS `.spinner`, `.spinner-sm/md/lg/accent`
- ✅ **P2** Skeleton / Shimmer — CSS `.skeleton`, `.skeleton-text`, `.skeleton-circle`
- ✅ **P2** Warning Badge — CSS `.badge.warning`
- ✅ **P3** Toast with inline action — `showToast({ action: { label, onClick } })`
- ✅ **P3** Screen reader toast announcement — `aria-live` assertive for errors

### Data Display
- ✅ **P1** Table — `bindTable` (sort, sticky header, row selection, column resize)
- ✅ **P2** Chip / Tag — CSS `.chip`, `.chip-accent`, `.chip-remove`, `.is-selected`
- ✅ **P2** Popover — `bindPopover`
- ✅ **P2** Rich List — CSS `.list`, `.list-item`, `.list-item-icon/text/secondary/action`, `.list-divider`
- ✅ **P2** Divider — CSS `.divider`, `.divider-vertical`, `.divider-label`
- ✅ **P3** Avatar — CSS `.avatar`, `.avatar-sm/md/lg`
- ✅ **P3** Tree View — `bindTree`, `bindCheckboxTree`
- ✅ **P2** Timeline — CSS `.timeline`, `.timeline-item`, `.timeline-dot`, `.timeline-time`, `.timeline-content`

### Navigation
- ✅ **P1** Breadcrumbs — CSS `.breadcrumbs`, `.breadcrumb-item`
- ✅ **P2** Stepper — `bindStepper` (horizontal + vertical)
- ✅ **P2** Drawer — `openDrawer`, `closeDrawer`
- ✅ **P2** Pagination — `bindPagination`
- ✅ **P3** Context Menu — `bindContextMenu`
- ✅ **P2** Navigation bar — `bindNavigation` (dropdowns, submenus, keyboard nav)
- ✅ **P2** Tabs — `bindTabs`
- ✅ **P2** Search combobox — `bindSearch`

### Overlays
- ✅ **P1** Modal — `openModal`, `closeModal`, `confirmModal`, `bindModal`
- ✅ **P1** Toast — `showToast`, `mountToast`, `createToastQueue`

### Layout & Surfaces
- ✅ **P1** Generic Card — CSS `.card`, `.card-header`, `.card-body`, `.card-footer`, `.card-compact`
- ✅ **P2** Accordion — `bindAccordion`
- ✅ **P2** Stack / Row utilities — CSS `.stack`, `.row`, `.gap-1`–`.gap-6`, `.align-*`, `.justify-*`
- ✅ **P3** Responsive breakpoints — `@media` utilities + `.hide-below-md`, `.hide-above-md`
- ✅ **P2** Split pane — `bindSplitPaneResize`
- ✅ **P2** Scroll panel — CSS `.scroll-panel`

### Accessibility
- ✅ **P1** ARIA for tabs — `role="tablist/tab/tabpanel"`, `aria-selected`, arrow key navigation
- ✅ **P1** Focus trap for modal — `trapFocus()` applied in `openModal` / `confirmModal`
- ✅ **P2** Keyboard nav for navigation bar — arrow keys, Enter, Escape, submenus
- ✅ **P2** Accessible search combobox — `role="combobox"`, `aria-expanded`, `aria-live`
- ✅ **P2** `prefers-reduced-motion` — global CSS block zeroing all durations
- ✅ **P3** Skip navigation link — CSS `.skip-link`

### Tokens & Foundations
- ✅ **P2** Elevation scale — `--elevation-1` through `--elevation-5`
- ✅ **P2** Z-index scale — `--z-dropdown/drawer/modal/toast/tooltip/overlay`
- ✅ **P3** Icon size tokens — `--icon-size-sm/md/lg`
- ✅ **P3** Focus ring token — `--focus-ring`

### Utilities
- ✅ **P1** `bindHotkey` — chord parsing, `mod` key, scoped target
- ✅ **P1** `bindClickOutside` — capture-phase pointer listener
- ✅ **P2** `bindResizeObserver` — `ResizeObserver` wrapper with auto-disconnect

### Demo App
- ✅ **P3** Token override panel — live `<input type="color">` controls for key tokens
- ✅ **P2** Interactive demo with event log — all `bind*` functions exercised live

### Documentation
- ✅ **P1** `bindMultiSelect` documented in `skills/references/forms.md`
- ✅ **P1** `bindTextField` documented in `skills/references/forms.md`
