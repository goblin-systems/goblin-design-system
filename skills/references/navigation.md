# Navigation

## Menu Bar

### API

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

Handle: `openItem(item)`, `closeItem(item)`, `closeAll()`

### Markup

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

Classes: `nav-bar`, `nav-item`, `nav-trigger`, `nav-dropdown`, `nav-option`, `nav-option--has-sub`, `nav-option--disabled`, `nav-option-icon`, `nav-option-label`, `nav-option-shortcut`, `nav-option-arrow`, `nav-divider`, `nav-submenu`, `is-open`, `is-sub-open`

**Important:** `.nav-option--has-sub` must be a `<div>`, not a `<button>`.

---

## Tabs

### API

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

`bindTabs()` manages `.is-active`, `hidden`, ARIA roles (`tablist`, `tab`, `tabpanel`), `aria-selected`, `aria-controls`, `aria-labelledby`, and roving tabindex on triggers.

### Markup

```html
<div class="top-tabs">
  <button class="top-tab is-active" data-tab-trigger="panel-a">Tab A</button>
  <button class="top-tab" data-tab-trigger="panel-b">Tab B</button>
</div>

<div class="tab-panel is-active" data-tab-panel="panel-a">A</div>
<div class="tab-panel" data-tab-panel="panel-b">B</div>
```

Document tabs (IDE-style with dirty indicator):

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

Classes: `top-tabs`, `top-tab`, `tab-panel`, `document-tabs`, `document-tab-wrap`, `document-tab`, `document-tab-dirty`, `document-tab-close`, `is-active`

---

## Stepper

### API

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

Handle: `setStep(index)`, `setStepState(index, state)`, `getStep()`, `next()`, `prev()`, `destroy()`

### Markup

```html
<!-- Horizontal -->
<div id="my-stepper" class="stepper">
  <div class="step step-complete"><span class="step-indicator">1</span><span class="step-label">One</span></div>
  <div class="step step-active"><span class="step-indicator">2</span><span class="step-label">Two</span></div>
  <div class="step"><span class="step-indicator">3</span><span class="step-label">Three</span></div>
</div>

<!-- Vertical -->
<div id="my-stepper" class="stepper stepper-vertical">
  <div class="step step-complete">
    <span class="step-indicator">1</span>
    <div class="step-content">
      <span class="step-label">Setup</span>
      <span class="step-description">Configure providers</span>
    </div>
  </div>
</div>
```

Classes: `stepper`, `stepper-vertical`, `step`, `step-indicator`, `step-label`, `step-content`, `step-description`, `step-active`, `step-complete`, `step-error`

---

## Pagination

### API

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

Handle: `setPage(page)`, `getPage()`, `setTotalPages(total)`, `destroy()`

`bindPagination()` renders its own buttons into the container element.

### Markup

```html
<nav id="my-pagination" class="pagination" aria-label="Pagination"></nav>
```

Classes (injected by JS): `pagination`, `page-btn`, `page-ellipsis`, `is-active`

---

## Window Shell

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

Classes: `app-shell`, `window-frame-row`, `window-title-wrap`, `window-title`, `window-subtitle`, `window-actions`, `window-action-btn`

For Tauri apps, wire the buttons with `setupWindowControls()` — see `tauri.md`.

---

## Breadcrumbs

CSS-only. Use `aria-current="page"` on the last item.

```html
<nav class="breadcrumbs">
  <a class="breadcrumb-item" href="#">Home</a>
  <a class="breadcrumb-item" href="#">Projects</a>
  <span class="breadcrumb-item" aria-current="page">Settings</span>
</nav>
```

Classes: `breadcrumbs`, `breadcrumb-item`

Custom separator (default `/`): `--breadcrumb-separator`
