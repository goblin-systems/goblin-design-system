---
name: goblin-design-system
description: Documents the Goblin Design System package, including built-in themes, public exports, CSS classes, markup patterns, design tokens, and usage constraints. Use when working with `@goblin-systems/goblin-design-system` or when building UI that should follow its square, vanilla TypeScript patterns.
---

# Goblin Design System

Package: `@goblin-systems/goblin-design-system`

## Install

```bash
npm install @goblin-systems/goblin-design-system lucide
```

- `lucide` is a required peer dependency.
- `@tauri-apps/api` is optional and only needed for the Tauri window helpers.

## Setup

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

applyIcons();
showToast("Ready", "success");
```

After any HTML containing `<i data-lucide="...">` is in the DOM, call `applyIcons()` again.

Theme switching also works without JavaScript by setting `data-theme` on any ancestor element. Omitting `data-theme` uses the default `goblin` theme.

## Design Rules

- Built-in themes: `goblin`, `dark`, `light`
- Square corners only
- Vanilla TS/JS only
- CSS classes provide appearance
- TypeScript functions provide behaviour
- Visual values come from CSS custom properties and `data-theme` token overrides

## Public Exports

### Icons

```ts
import {
  applyIcons,
  createIcon,
  ICON_SET,
  type IconNode,
} from "@goblin-systems/goblin-design-system";
```

- `applyIcons()` replaces `<i data-lucide="..."></i>` placeholders currently in the DOM
- `createIcon(name)` returns a single `SVGSVGElement | null`
- `ICON_SET` is the full Lucide-backed icon map used by the package
- icon names are kebab-case, for example `search`, `chevron-right`, `trash-2`

### DOM Helpers

```ts
import {
  byId,
  byIdOptional,
  qs,
  qsAll,
  populateSelectOptions,
  setGroupDisabled,
} from "@goblin-systems/goblin-design-system";
```

- `byId<T>(id, doc?)` throws if the element is missing
- `byIdOptional<T>(id, doc?)` returns `null` when missing
- `qs<T>(selector, root?)` throws if the element is missing
- `qsAll<T>(selector, root?)` returns all matches
- `populateSelectOptions(select, options, preferred)` replaces all `<option>` nodes and disables the `<select>` when empty
- `setGroupDisabled(container, disabled)` toggles `disabled` on child `input`, `select`, and `button` elements

### Themes

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

- `BuiltinTheme` and `UiTheme` are the built-in theme union: `goblin | dark | light`
- `BUILTIN_THEMES` is the ordered built-in theme list
- `THEME_LABELS` maps theme ids to display labels
- `applyTheme(theme)` is an alias of `setTheme(theme, options?)`
- `setTheme(theme, options?)` sets `data-theme` on `document.documentElement` by default
- `getTheme(target?)` reads `data-theme` and falls back to `goblin`
- `isBuiltinTheme()` and `isUiTheme()` validate unknown values

### Tabs

```ts
import { bindTabs, type TabsOptions } from "@goblin-systems/goblin-design-system";

const tabs = bindTabs({
  root: document,
  triggerSelector: "[data-tab-trigger]",
  panelSelector: "[data-tab-panel]",
  onChange: (tabId) => console.log(tabId),
});

tabs.activate("panel-a");
```

`bindTabs()` toggles `.is-active` on matching triggers and panels.

### Navigation

```ts
import {
  bindNavigation,
  type NavigationHandle,
  type NavigationOptions,
} from "@goblin-systems/goblin-design-system";

const nav = bindNavigation({
  root: document.getElementById("my-nav") ?? document,
  onSelect: (id) => console.log(id),
});

nav.closeAll();
```

Returned handle:

- `openItem(item)`
- `closeItem(item)`
- `closeAll()`

### Toast

```ts
import {
  mountToast,
  showToast,
  type ToastOptions,
  type ToastVariant,
} from "@goblin-systems/goblin-design-system";

showToast("Saved", "success");
showToast("Failed", "error", 4000);

mountToast(document.getElementById("app-toast")!, {
  message: "Saved",
  variant: "success",
  durationMs: 3000,
});
```

### Search

```ts
import {
  bindSearch,
  type SearchHandle,
  type SearchOptions,
} from "@goblin-systems/goblin-design-system";

const search = bindSearch({
  input: document.getElementById("my-search") as HTMLInputElement,
  debounce: 200,
  minChars: 0,
  onSearch: (query) => {
    search.setSuggestions(myItems.filter((item) => item.includes(query)));
  },
  onSelect: (value) => console.log(value),
});

search.clearSuggestions();
search.destroy();
```

Returned handle:

- `setSuggestions(items)`
- `clearSuggestions()`
- `destroy()`

### Tooltips

```ts
import {
  bindTooltips,
  type TooltipHandle,
  type TooltipOptions,
} from "@goblin-systems/goblin-design-system";

const tooltips = bindTooltips({
  root: document,
  showDelayMs: 400,
  hideDelayMs: 80,
});

tooltips.destroy();
```

- Binds every `[data-tooltip]` element within `root`
- Uses `data-tooltip-placement="top|bottom|left|right"` when present and flips when needed

### Double Range Slider

```ts
import {
  bindRange,
  type RangeHandle,
  type RangeOptions,
} from "@goblin-systems/goblin-design-system";

const range = bindRange({
  el: document.getElementById("my-range")!,
  min: 0,
  max: 100,
  step: 1,
  value: [20, 80],
  inverted: false,
  onChange: (lo, hi) => console.log(lo, hi),
});

range.setValue(30, 70);
range.getValue();
range.destroy();
```

Returned handle:

- `setValue(lo, hi)`
- `getValue()`
- `destroy()`

### Radial Control

```ts
import {
  bindRadial,
  type RadialHandle,
  type RadialOptions,
} from "@goblin-systems/goblin-design-system";

const radial = bindRadial({
  el: document.getElementById("my-radial")!,
  min: 0,
  max: 360,
  step: 5,
  value: 135,
  startAngle: -90,
  endAngle: 270,
  formatValue: (value) => `${value}°`,
  onChange: (value) => console.log(value),
});

radial.setValue(180);
radial.getValue();
radial.destroy();
```

Returned handle:

- `setValue(value)`
- `getValue()`
- `destroy()`

### Modal

```ts
import {
  bindModal,
  closeModal,
  confirmModal,
  openModal,
  type ConfirmOptions,
  type ModalOptions,
} from "@goblin-systems/goblin-design-system";

openModal({
  backdrop: document.getElementById("my-modal")!,
  onAccept: () => console.log("accepted"),
  onReject: () => console.log("rejected"),
});

bindModal("open-modal-btn", "my-modal");

closeModal({
  backdrop: document.getElementById("my-modal")!,
});

const ok = await confirmModal({
  title: "Delete item?",
  message: "This cannot be undone.",
  acceptLabel: "Delete",
  rejectLabel: "Cancel",
  variant: "danger",
});
```

### Switch

```ts
import {
  bindSwitch,
  type SwitchHandle,
  type SwitchOptions,
} from "@goblin-systems/goblin-design-system";

const toggle = bindSwitch({
  el: document.getElementById("my-switch")!,
  value: true,
  onChange: (checked) => console.log(checked),
});

toggle.getValue();
toggle.setValue(false);
toggle.destroy();
```

Returned handle:

- `getValue()`
- `setValue(checked)`
- `destroy()`

### Accordion

```ts
import {
  bindAccordion,
  type AccordionHandle,
  type AccordionOptions,
} from "@goblin-systems/goblin-design-system";

const accordion = bindAccordion({
  el: document.getElementById("my-accordion")!,
  multiple: false,
  onChange: (item, open) => console.log(item, open),
});

accordion.toggle(document.querySelector(".accordion-item")!);
```

Returned handle:

- `open(itemEl)`
- `close(itemEl)`
- `toggle(itemEl)`
- `destroy()`

### Drawer

```ts
import {
  closeDrawer,
  openDrawer,
  type DrawerOptions,
} from "@goblin-systems/goblin-design-system";

const drawer = document.getElementById("my-drawer")!;

openDrawer({
  drawer,
  closeOnBackdrop: true,
  closeOnEscape: true,
});

closeDrawer({ drawer });
```

- `openDrawer()` traps focus, locks body scroll, and creates a backdrop when needed
- `closeDrawer()` closes either an active managed drawer or a manually rendered one

### Pagination

```ts
import {
  bindPagination,
  type PaginationHandle,
  type PaginationOptions,
} from "@goblin-systems/goblin-design-system";

const pagination = bindPagination({
  el: document.getElementById("my-pagination")!,
  totalPages: 24,
  currentPage: 3,
  siblingCount: 1,
  onChange: (page) => console.log(page),
});

pagination.setPage(4);
pagination.setTotalPages(18);
```

Returned handle:

- `setPage(page)`
- `getPage()`
- `setTotalPages(total)`
- `destroy()`

### Popover

```ts
import {
  bindPopover,
  type PopoverHandle,
  type PopoverOptions,
  type PopoverPlacement,
  type PopoverTrigger,
} from "@goblin-systems/goblin-design-system";

const popover = bindPopover({
  anchor: document.getElementById("popover-btn")!,
  content: document.getElementById("popover-card")!,
  placement: "bottom",
  trigger: "click",
});

popover.open();
popover.close();
```

Returned handle:

- `open()`
- `close()`
- `toggle()`
- `destroy()`

### Split Pane

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

### Stepper

```ts
import {
  bindStepper,
  type StepperHandle,
  type StepperOptions,
  type StepState,
} from "@goblin-systems/goblin-design-system";

const stepper = bindStepper({
  el: document.getElementById("my-stepper")!,
  currentStep: 1,
  onChange: (index, state) => console.log(index, state),
});

stepper.next();
stepper.setStepState(2, "error");
```

Returned handle:

- `setStep(index)`
- `setStepState(index, state)`
- `getStep()`
- `next()`
- `prev()`
- `destroy()`

### Toggle Group

```ts
import {
  bindToggleGroup,
  type ToggleGroupHandle,
  type ToggleGroupOptions,
} from "@goblin-systems/goblin-design-system";

const group = bindToggleGroup({
  el: document.getElementById("my-toggle-group")!,
  multiple: true,
  value: ["snap", "guides"],
  onChange: (selected) => console.log(selected),
});

group.getSelected();
group.setSelected(["snap"]);
```

Returned handle:

- `getSelected()`
- `setSelected(values)`
- `destroy()`

### Table

```ts
import {
  bindTable,
  type TableHandle,
  type TableOptions,
  type TableSortDirection,
} from "@goblin-systems/goblin-design-system";

const table = bindTable({
  el: document.getElementById("my-table") as HTMLTableElement,
  onSort: (column, direction) => console.log(column, direction),
});

table.getSort();
```

- Sortable headers use `.table-sortable` inside `<thead>`
- Sorting cycles `asc -> desc -> none`

### Select

```ts
import {
  bindSelect,
  type SelectHandle,
  type SelectOption,
  type SelectOptions,
} from "@goblin-systems/goblin-design-system";

const select = bindSelect({
  el: document.getElementById("my-select")!,
  onChange: (value) => console.log(value),
});

select.open();
select.setValue("vision");
```

Returned handle:

- `getValue()`
- `setValue(value)`
- `open()`
- `close()`
- `destroy()`

### Transfer List

```ts
import {
  bindTransferList,
  type TransferListHandle,
  type TransferListOptions,
} from "@goblin-systems/goblin-design-system";

const transfer = bindTransferList({
  el: document.getElementById("my-transfer-list")!,
});

transfer.getLeft();
transfer.getRight();
```

Returned handle:

- `getLeft()`
- `getRight()`
- `destroy()`

### Rating

```ts
import {
  bindRating,
  type RatingHandle,
  type RatingOptions,
} from "@goblin-systems/goblin-design-system";

const rating = bindRating({
  el: document.getElementById("my-rating")!,
  value: 3,
  max: 5,
  onChange: (value) => console.log(value),
});

rating.setValue(4);
rating.getValue();
```

Returned handle:

- `getValue()`
- `setValue(value)`
- `destroy()`

### Tree

```ts
import {
  bindTree,
  type TreeHandle,
  type TreeOptions,
} from "@goblin-systems/goblin-design-system";

const tree = bindTree({
  el: document.getElementById("my-tree")!,
});

tree.expandAll();
tree.collapseAll();
```

Returned handle:

- `expand(item)`
- `collapse(item)`
- `expandAll()`
- `collapseAll()`
- `destroy()`

### Context Menu

```ts
import {
  bindContextMenu,
  type ContextMenuHandle,
  type ContextMenuItem,
  type ContextMenuOptions,
} from "@goblin-systems/goblin-design-system";

const menu = bindContextMenu({
  target: document.getElementById("target")!,
  items: [
    { id: "rename", label: "Rename", icon: "pencil", onSelect: () => console.log("rename") },
    { divider: true },
    { id: "delete", label: "Delete", icon: "trash-2", shortcut: "Del" },
  ],
});

menu.open(120, 80);
```

Returned handle:

- `open(x, y)`
- `close()`
- `destroy()`

### Tauri Helpers

```ts
import {
  setupContextMenuGuard,
  setupWindowControls,
  type WindowControlOptions,
} from "@goblin-systems/goblin-design-system";

setupWindowControls({
  minimizeBtnId: "window-minimize-btn",
  maximizeBtnId: "window-maximize-btn",
  closeBtnId: "window-close-btn",
});

setupContextMenuGuard();
```

### Waveform

```ts
import {
  WAVEFORM_COLOR_SCHEMES,
  WAVEFORM_STYLES,
  createWaveProgressGradient,
  cycleWaveformColorScheme,
  cycleWaveformStyle,
  drawWaveform,
  getWaveformColorSchemeLabel,
  getWaveformStyleLabel,
  isWaveformColorScheme,
  isWaveformStyle,
  type DrawWaveformOptions,
  type WaveformColorScheme,
  type WaveformStyle,
} from "@goblin-systems/goblin-design-system";
```

- `WAVEFORM_STYLES`: `classic`, `bars`, `pulse`, `bloom`, `fan`
- `WAVEFORM_COLOR_SCHEMES`: `aurora`, `ember`, `glacier`, `sunset`, `monochrome`
- `drawWaveform(style, options)` draws a frame into a canvas context
- `createWaveProgressGradient(ctx, height, colorScheme)` builds a vertical progress gradient
- `isWaveformStyle()` and `isWaveformColorScheme()` validate unknown values
- `cycleWaveformStyle()` and `cycleWaveformColorScheme()` step through the available sets
- `getWaveformStyleLabel()` and `getWaveformColorSchemeLabel()` return display labels

Minimal canvas usage:

```ts
const canvas = document.querySelector("canvas")!;
const ctx = canvas.getContext("2d")!;

drawWaveform("classic", {
  ctx,
  width: canvas.width,
  height: canvas.height,
  amplitude: 18,
  phase: performance.now() / 180,
  active: true,
  colorScheme: "aurora",
});
```

## Markup Patterns

### Buttons

```html
<button class="secondary-btn">Label</button>
<button class="secondary-btn slim-btn">Small</button>
<button class="secondary-btn help-btn">?</button>

<button class="icon-btn"><i data-lucide="search"></i></button>
<button class="icon-btn icon-btn-sm"><i data-lucide="x"></i></button>
<button class="icon-btn icon-btn-md"><i data-lucide="search"></i></button>
<button class="icon-btn icon-btn-lg"><i data-lucide="plus"></i></button>
```

Classes:

- `secondary-btn`
- `slim-btn`
- `help-btn`
- `icon-btn`
- `icon-btn-sm`
- `icon-btn-md`
- `icon-btn-lg`
- `is-active`

### Window Shell

```html
<div class="app-shell">
  <div class="window-frame-row">
    <div class="window-title-wrap">
      <div class="window-title">Goblin</div>
      <div class="window-subtitle">Desktop UI</div>
    </div>
    <div class="window-actions">
      <button id="window-minimize-btn" class="icon-btn window-action-btn"><i data-lucide="minus"></i></button>
      <button id="window-maximize-btn" class="icon-btn window-action-btn"><i data-lucide="maximize-2"></i></button>
      <button id="window-close-btn" class="icon-btn window-action-btn"><i data-lucide="x"></i></button>
    </div>
  </div>
</div>
```

Classes:

- `app-shell`
- `window-frame-row`
- `window-title-wrap`
- `window-title`
- `window-subtitle`
- `window-actions`
- `window-action-btn`

### Tabs

```html
<div class="top-tabs">
  <button class="top-tab is-active" data-tab-trigger="panel-a">Tab A</button>
  <button class="top-tab" data-tab-trigger="panel-b">Tab B</button>
</div>

<div class="tab-panel is-active" data-tab-panel="panel-a">A</div>
<div class="tab-panel" data-tab-panel="panel-b">B</div>
```

Document tabs:

```html
<div class="document-tabs">
  <div class="document-tab-wrap">
    <button class="document-tab is-active" data-tab-trigger="doc-1">
      <span class="document-tab-dirty"></span>
      <span>doc-1</span>
    </button>
    <button class="document-tab-close" type="button">x</button>
  </div>
</div>
```

Classes:

- `top-tabs`
- `top-tab`
- `tab-panel`
- `document-tabs`
- `document-tab-wrap`
- `document-tab`
- `document-tab-dirty`
- `document-tab-close`
- `is-active`

### Modal

```html
<div id="my-modal" class="modal-backdrop" hidden>
  <div class="modal-card">
    <div class="modal-header">
      <h3>Title</h3>
      <button class="icon-btn modal-close-btn modal-btn-reject" aria-label="Close">
        <i data-lucide="x"></i>
      </button>
    </div>
    <p class="modal-body-text">Body text here.</p>
    <ul class="modal-list">
      <li>Optional list content</li>
    </ul>
    <div class="modal-footer">
      <button class="secondary-btn modal-btn-reject">Cancel</button>
      <button class="modal-btn-accept">Confirm</button>
      <button class="modal-btn-accept danger">Delete</button>
    </div>
  </div>
</div>
```

Classes:

- `modal-backdrop`
- `modal-card`
- `modal-header`
- `modal-close-btn`
- `modal-body-text`
- `modal-list`
- `modal-footer`
- `modal-btn-accept`
- `modal-btn-reject`
- `danger`
- `modal-open` on `body` while open

### Toast

```html
<div id="app-toast" class="app-toast" role="status" aria-live="polite"></div>
```

State classes applied by JS:

- `visible`
- `success`
- `error`
- `info`

### Navigation

```html
<nav id="my-nav" class="nav-bar">
  <div class="nav-item">
    <button class="nav-trigger">File <i data-lucide="chevron-down"></i></button>
    <div class="nav-dropdown">
      <button class="nav-option" data-nav-id="new">
        <span class="nav-option-icon"><i data-lucide="file-plus"></i></span>
        <span class="nav-option-label">New</span>
        <span class="nav-option-shortcut">Ctrl+N</span>
      </button>
      <div class="nav-divider"></div>
      <div class="nav-option nav-option--has-sub">
        <span class="nav-option-icon"><i data-lucide="upload"></i></span>
        <span class="nav-option-label">Export As</span>
        <span class="nav-option-arrow"><i data-lucide="chevron-right"></i></span>
        <div class="nav-submenu">
          <button class="nav-option" data-nav-id="export-png">PNG</button>
          <button class="nav-option" data-nav-id="export-svg">SVG</button>
        </div>
      </div>
      <button class="nav-option nav-option--disabled" data-nav-id="save">Save</button>
    </div>
  </div>
</nav>
```

Classes:

- `nav-bar`
- `nav-item`
- `nav-trigger`
- `nav-dropdown`
- `nav-option`
- `nav-option--has-sub`
- `nav-option--disabled`
- `nav-option-icon`
- `nav-option-label`
- `nav-option-shortcut`
- `nav-option-arrow`
- `nav-divider`
- `nav-submenu`
- `is-open`
- `is-sub-open`

Important: `.nav-option--has-sub` must be a container such as `<div>`, not a nested `<button>`.

### Search

```html
<div class="search-field" style="width: 280px">
  <span class="search-field-icon"><i data-lucide="search"></i></span>
  <input id="my-search" type="text" placeholder="Search..." />
  <div class="search-suggestions"></div>
</div>
```

Classes:

- `search-field`
- `search-field-icon`
- `search-suggestions`
- `search-suggestion`
- `is-open`
- `is-active`

### Tooltip Anchors

```html
<button data-tooltip="Refresh dataset" data-tooltip-placement="bottom">
  <i data-lucide="refresh-cw"></i>
</button>
```

Attributes managed by JS:

- `data-tooltip`
- `data-tooltip-placement`
- `data-tooltip-visible`
- `data-tooltip-side`

### Double Range Slider

```html
<div id="my-range" class="range-slider">
  <div class="range-track">
    <div class="range-fill"></div>
    <div class="range-fill-end"></div>
    <div class="range-thumb" data-thumb="lo"></div>
    <div class="range-thumb" data-thumb="hi"></div>
  </div>
  <div class="range-labels">
    <span class="range-label-lo"></span>
    <span class="range-label-hi"></span>
  </div>
</div>
```

Classes:

- `range-slider`
- `range-track`
- `range-fill`
- `range-fill-end`
- `range-thumb`
- `range-labels`
- `range-label-lo`
- `range-label-hi`
- `is-dragging`

Use `.range-fill-end` only when using `inverted: true`.

### Radial Control

```html
<div id="my-radial" class="radial-control">
  <svg class="radial-control-visual" viewBox="0 0 100 100" aria-hidden="true">
    <path class="radial-control-track"></path>
    <path class="radial-control-fill"></path>
    <line class="radial-control-pointer" x1="50" y1="50" x2="50" y2="22"></line>
    <circle class="radial-control-thumb" cx="50" cy="12" r="5"></circle>
  </svg>
  <div class="radial-control-readout">
    <span class="radial-control-value"></span>
    <span class="radial-control-caption">Heading</span>
  </div>
</div>
```

Classes:

- `radial-control`
- `radial-control-sm`
- `radial-control-xs`
- `radial-control-visual`
- `radial-control-track`
- `radial-control-fill`
- `radial-control-pointer`
- `radial-control-thumb`
- `radial-control-readout`
- `radial-control-value`
- `radial-control-caption`
- `is-dragging`

Optional CSS variables for per-instance styling:

- `--radial-control-fill-color`
- `--radial-control-track-color`
- `--radial-control-thumb-stroke`
- `--radial-control-focus-ring`

### Switch

```html
<label id="my-switch" class="switch">
  <input type="checkbox" />
  <span class="switch-track"><span class="switch-thumb"></span></span>
  <span class="switch-label">Auto-correct</span>
</label>
```

Classes:

- `switch`
- `switch-track`
- `switch-thumb`
- `switch-label`

### Accordion

```html
<div id="my-accordion" class="accordion">
  <div class="accordion-item is-open">
    <button class="accordion-trigger">
      <span>Section</span>
      <i data-lucide="chevron-down"></i>
    </button>
    <div class="accordion-panel">Panel body</div>
  </div>
</div>
```

Classes:

- `accordion`
- `accordion-item`
- `accordion-trigger`
- `accordion-panel`
- `is-open`

### Drawer

```html
<div id="my-drawer" class="drawer drawer-right" aria-hidden="true" hidden>
  <div class="drawer-header">
    <h3>Properties</h3>
    <button class="icon-btn icon-btn-sm"><i data-lucide="x"></i></button>
  </div>
  <div class="drawer-body">...</div>
  <div class="drawer-footer">...</div>
</div>
```

Classes:

- `drawer-backdrop`
- `drawer`
- `drawer-left`
- `drawer-right`
- `drawer-header`
- `drawer-body`
- `drawer-footer`
- `drawer-open` on `body` while open
- `is-open`

### Pagination

```html
<nav id="my-pagination" class="pagination" aria-label="Pagination"></nav>
```

Classes:

- `pagination`
- `page-btn`
- `page-ellipsis`
- `is-active`

### Popover

```html
<button id="popover-btn" class="secondary-btn">Open</button>

<div id="popover-card" class="popover">
  <div class="popover-title">Quick action</div>
  <div>Body</div>
</div>
```

Classes:

- `popover`
- `popover-title`
- `is-open`

Dataset applied by JS:

- `data-placement`

### Stepper

```html
<div id="my-stepper" class="stepper">
  <div class="step step-complete"><span class="step-indicator">1</span><span class="step-label">One</span></div>
  <div class="step step-active"><span class="step-indicator">2</span><span class="step-label">Two</span></div>
  <div class="step"><span class="step-indicator">3</span><span class="step-label">Three</span></div>
</div>
```

Classes:

- `stepper`
- `step`
- `step-indicator`
- `step-label`
- `step-active`
- `step-complete`
- `step-error`

### Toggle Group

```html
<div id="my-toggle-group" class="btn-group">
  <button class="secondary-btn is-active" data-value="snap">Snap</button>
  <button class="secondary-btn" data-value="guides">Guides</button>
</div>
```

Toggle groups reuse `.btn-group` styling and JS manages `.is-active` plus `aria-pressed`.

### Table

```html
<table id="my-table" class="table">
  <thead>
    <tr>
      <th class="table-sortable">Name</th>
      <th class="table-sortable">Size</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Banner.png</td><td>2.4 MB</td></tr>
  </tbody>
</table>
```

Classes:

- `table`
- `table-compact`
- `table-sortable`
- `sort-asc`
- `sort-desc`

### Custom Select

```html
<div id="my-select" class="custom-select">
  <label for="my-select-native">Theme</label>
  <select id="my-select-native" class="custom-select-native">
    <option value="goblin" data-icon="sparkles">Goblin</option>
  </select>
  <button type="button" class="secondary-btn custom-select-trigger"></button>
  <div class="custom-select-list">
    <input class="custom-select-search" type="text" placeholder="Filter options..." />
  </div>
</div>
```

Classes:

- `custom-select`
- `custom-select-native`
- `custom-select-trigger`
- `custom-select-list`
- `custom-select-search`
- `custom-select-group`
- `custom-select-group-label`
- `custom-select-option`
- `custom-select-option-icon`
- `is-enhanced`
- `is-open`
- `is-active`
- `is-selected`

### Transfer List

```html
<div id="my-transfer-list" class="transfer-list">
  <div class="transfer-list-column">
    <div class="transfer-list-items" data-transfer-list="left">
      <button type="button" class="transfer-list-item" data-value="title">Title</button>
    </div>
  </div>
  <div class="transfer-list-actions">
    <button class="secondary-btn slim-btn" data-transfer-action="to-right">&gt;</button>
  </div>
  <div class="transfer-list-column">
    <div class="transfer-list-items" data-transfer-list="right"></div>
  </div>
</div>
```

Classes and attributes:

- `transfer-list`
- `transfer-list-column`
- `transfer-list-items`
- `transfer-list-item`
- `transfer-list-actions`
- `is-selected`
- `data-transfer-list="left|right"`
- `data-transfer-action="to-right|all-right|to-left|all-left"`

### Rating

```html
<div id="my-rating" class="rating" data-rating-value="3" aria-label="Rating input">
  <button class="rating-star" type="button"><i data-lucide="star"></i></button>
  <button class="rating-star" type="button"><i data-lucide="star"></i></button>
  <button class="rating-star" type="button"><i data-lucide="star"></i></button>
</div>
```

Classes:

- `rating`
- `rating-star`
- `is-active`

### Tree

```html
<ul id="my-tree" class="tree" role="tree">
  <li class="tree-item is-open" style="--tree-depth:0">
    <div class="tree-row">
      <button class="tree-toggle" type="button"><i data-lucide="chevron-right"></i> src</button>
    </div>
    <ul class="tree-branch">
      <li class="tree-item" style="--tree-depth:1">
        <div class="tree-row">
          <button class="tree-leaf" type="button"><i data-lucide="file-code-2"></i> index.ts</button>
        </div>
      </li>
    </ul>
  </li>
</ul>
```

Classes:

- `tree`
- `tree-item`
- `tree-row`
- `tree-toggle`
- `tree-leaf`
- `tree-branch`
- `is-open`

### Context Menu

`bindContextMenu()` renders its menu for you and reuses existing nav dropdown styles.

Classes used internally:

- `context-menu`
- `nav-dropdown`
- `nav-option`
- `nav-option--disabled`
- `nav-option-icon`
- `nav-option-label`
- `nav-option-shortcut`
- `nav-divider`
- `is-open`

### Native Form Elements

Styled automatically from `base.css`:

```html
<input type="text" placeholder="..." />
<input type="password" />
<input type="number" />
<select><option>...</option></select>
<input type="checkbox" />
<input type="radio" name="g" />
<input type="range" min="0" max="100" value="50" />
```

To animate native range fill, update `--_pct`:

```ts
function syncFill(input: HTMLInputElement) {
  const pct = ((+input.value - +input.min) / (+input.max - +input.min)) * 100;
  input.style.setProperty("--_pct", `${pct}%`);
}
```

### Field Helpers

```html
<div class="field">
  <div class="field-block">
    <label>Label</label>
    <input type="text" />
  </div>
  <span class="unit">px</span>
</div>

<label class="inline-field">
  <span>Zoom</span>
  <input type="range" min="0" max="100" value="50" />
  <input type="number" value="50" />
</label>

<div class="language-grid">
  <div class="language-field">
    <label>English</label>
    <input type="text" />
  </div>
</div>
```

Classes:

- `field`
- `field-block`
- `inline-field`
- `language-grid`
- `language-field`
- `unit`

### Radio And Checkbox Groups

```html
<div class="radio-group">
  <label class="radio-label"><input type="radio" name="mode" /> One</label>
  <label class="checkbox-label"><input type="checkbox" /> Enabled</label>
</div>
```

Classes:

- `radio-group`
- `radio-label`
- `checkbox-label`

### Surfaces And Layout Helpers

```html
<div class="settings-section">
  <div class="section-heading-row">
    <h2>Section title</h2>
    <div class="toolbar-actions"></div>
  </div>
  <p class="hint">Helpful text</p>
  <span class="kbd">Ctrl+S</span>
</div>

<div class="mini-panel">...</div>
<div class="demo-row">...</div>
<div class="demo-grid">...</div>
```

Reusable classes:

- `settings-section`
- `mini-panel`
- `section-heading-row`
- `toolbar-actions`
- `hint`
- `kbd`
- `demo-section`
- `demo-row`
- `demo-grid`

Demo-only helpers:

- `demo-swatch-grid`
- `demo-swatch`
- `demo-radius-strip`
- `demo-radius-box`
- `demo-type-scale`
- `demo-type-row`
- `demo-type-label`
- `icon-gallery-cell`

### Badges And Status

```html
<span class="badge default">Stable</span>
<span class="badge beta">Beta</span>
<span class="badge success">Ready</span>
<span class="badge error">Failed</span>

<div class="status-row">
  <span class="status-indicator connected">
    <span class="status-dot"></span>
    <span>Connected</span>
  </span>
</div>
```

Classes:

- `badge`
- `default`
- `beta`
- `success`
- `error`
- `status-row`
- `status-indicator`
- `status-dot`
- `connected`
- `untested`
- `disconnected`
- `error`

### Split Workspace

```html
<div id="workspace" class="editor-workspace">
  <aside class="editor-tools-pane">...</aside>
  <div id="left-pane-resizer" class="pane-resizer"></div>
  <main class="editor-canvas-pane">...</main>
  <div id="right-pane-resizer" class="pane-resizer"></div>
  <aside class="editor-sidebar-pane">...</aside>
</div>
```

Classes:

- `editor-workspace`
- `editor-tools-pane`
- `editor-canvas-pane`
- `editor-sidebar-pane`
- `pane-resizer`
- `left-collapsed`
- `right-collapsed`

Width variables:

- `--left-panel-width`
- `--right-panel-width`

### Scroll Panel

```html
<div class="scroll-panel scroll-panel-lg">...</div>
```

Modifiers:

- `scroll-panel-sm`
- `scroll-panel-md`
- `scroll-panel-lg`
- `scroll-panel-xl`

Custom height:

```html
<div class="scroll-panel" style="--scroll-panel-height: 400px"></div>
```

### Status Bar, Lists, Stats, Empty State

```html
<div class="editor-status-bar">...</div>

<ul class="compact-list">
  <li>Item</li>
</ul>

<div class="stack-actions">...</div>

<div class="stat-grid">
  <div class="stat-card"><span>Items</span><strong>12</strong></div>
</div>

<div class="empty-state">
  <div class="empty-state-card">No data</div>
</div>
```

Classes:

- `editor-status-bar`
- `compact-list`
- `stack-actions`
- `stat-grid`
- `stat-card`
- `empty-state`
- `empty-state-card`

### Waveform Panel

```html
<div class="wave-panel">
  <div class="wave-canvas-wrap">
    <canvas id="wave-canvas"></canvas>
  </div>
  <div class="wave-controls">
    <span class="wave-label">Classic</span>
  </div>
</div>
```

Classes:

- `wave-panel`
- `wave-canvas-wrap`
- `wave-controls`
- `wave-label`

### Overlay Structure

Reusable overlay-related classes:

```html
<div class="overlay-pill">
  <div class="overlay-main-row">
    <span class="recording-dot listening"></span>
    <span class="overlay-label">Listening...</span>
    <span class="overlay-timer">0:00</span>
  </div>
  <div class="overlay-wave-wrap"><canvas></canvas></div>
  <div class="overlay-hud">...</div>
  <div class="overlay-transcript visible">Transcript</div>
</div>
```

Classes:

- `overlay-base`
- `overlay-pill`
- `overlay-main-row`
- `recording-dot`
- `loading`
- `listening`
- `transcribing`
- `correcting`
- `done`
- `overlay-label`
- `overlay-timer`
- `overlay-wave-wrap`
- `overlay-hud`
- `overlay-transcript`
- `visible`

## Tokens

`style.css` ships the official `goblin`, `dark`, and `light` token blocks. Goblin is the default via `:root`, and the same token set is also available under `[data-theme="goblin"]`.

To add an app-specific theme, override tokens after importing the stylesheet and scope them with `data-theme`.

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

Built-in theme switching works with either CSS or TypeScript:

```html
<html data-theme="light"></html>
```

```ts
applyTheme("dark");
```

Also available in the token set:

- font sizes `--font-size-xs` through `--font-size-2xl`
- spacing `--space-1` through `--space-10`
- durations `--duration-fast`, `--duration-base`, `--duration-slow`
- shadows such as `--shadow-card`, `--shadow-modal`, `--shadow-toast`
- component tokens such as `--top-tab-active-bg`, `--editor-status-bg`, `--pane-resizer-bg`, `--toast-bg`, and `--wave-panel-bg`
- scrollbar tokens used by global and scroll-panel styles

## Behaviour Notes

- `style.css` is required for the package to look correct
- `applyIcons()` only affects icon placeholders already in the DOM; call it again after injecting HTML
- `createIcon()` returns `null` for unknown icon names
- `byId()` and `qs()` throw when elements are missing
- `bindTabs()` only toggles `.is-active`; it does not manage ARIA, focus, or `hidden`
- `.search-suggestions` must live inside the same `.search-field` as the bound input
- `showToast()` silently does nothing if the toast element does not exist
- `bindRange()` expects the documented child structure to exist
- `bindRange().setValue()` updates the UI but does not call `onChange`
- inverted range UI needs `.range-fill-end`
- `bindRadial()` expects the documented SVG child structure to exist
- `bindRadial()` sweeps clockwise from `startAngle` to `endAngle`; identical angles mean a full circle
- `bindRadial().setValue()` updates the UI but does not call `onChange`
- `bindSwitch()` expects an `input[type="checkbox"]` inside `.switch`
- `bindAccordion()` wires ARIA ids for `.accordion-trigger` and `.accordion-panel`
- `closeModal()` removes `body.modal-open`; stacked modals are not supported
- `openDrawer()` moves the drawer to `document.body` if needed, traps focus, and manages a backdrop
- `bindPagination()` renders its own buttons into `.pagination`
- `bindPopover()` appends the popover to `document.body` and writes `data-placement`
- `bindSelect()` expects `.custom-select-native`, `.custom-select-trigger`, and `.custom-select-list`
- `bindSelect()` adds `.is-enhanced` and hides the native `<select>` from tab order
- `bindTransferList()` expects `data-transfer-list` and `data-transfer-action` hooks exactly as documented
- `bindRating()` treats the root as a slider and toggles `.is-active` on `.rating-star`
- `bindTree()` expects `.tree-item`, `.tree-toggle` / `.tree-leaf`, and nested `.tree-branch`
- `bindContextMenu()` creates and owns the menu DOM
- `setupWindowControls()` is only for Tauri apps
- `setupContextMenuGuard()` disables right-click and keyboard context-menu shortcuts globally
- `drawWaveform()` is low-level canvas drawing; the caller owns animation, clearing, sizing, and DPR handling

## Consumer Guidance

- Prefer the documented class names and structure exactly as shown
- Keep behaviour headless and markup-driven
- Use CSS custom properties instead of hardcoded colours
- Prefer `data-theme` token overrides over selector-specific visual overrides
- Built-in theme switching should not require app-local overrides for design-system-owned visuals
- Do not introduce rounded corners when extending the system
