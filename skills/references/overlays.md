# Overlays

## Modal

### API

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

closeModal({ backdrop: document.getElementById("my-modal")! });

const ok = await confirmModal({
  title: "Delete item?",
  message: "This cannot be undone.",
  acceptLabel: "Delete",
  rejectLabel: "Cancel",
  variant: "danger",
});
```

`closeModal()` removes `body.modal-open`. Stacked modals are not supported.

### Markup

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

Classes: `modal-backdrop`, `modal-card`, `modal-header`, `modal-close-btn`, `modal-body-text`, `modal-list`, `modal-footer`, `modal-btn-accept`, `modal-btn-reject`, `danger`, `modal-open` (on `body` while open)

---

## Drawer

### API

```ts
import {
  closeDrawer,
  openDrawer,
  type DrawerOptions,
} from "@goblin-systems/goblin-design-system";

const drawer = document.getElementById("my-drawer")!;

openDrawer({ drawer, closeOnBackdrop: true, closeOnEscape: true });
closeDrawer({ drawer });
```

`openDrawer()` moves the drawer to `document.body` if needed, traps focus, locks body scroll, and creates a backdrop.

### Markup

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

Classes: `drawer-backdrop`, `drawer`, `drawer-left`, `drawer-right`, `drawer-header`, `drawer-body`, `drawer-footer`, `drawer-open` (on `body`), `is-open`

---

## Toast

### API

```ts
import {
  mountToast,
  showToast,
  createToastQueue,
  type ToastOptions,
  type ToastVariant,
  type ToastQueueHandle,
} from "@goblin-systems/goblin-design-system";

showToast("Saved", "success");
showToast("Failed", "error", 4000);

mountToast(document.getElementById("app-toast")!, {
  message: "Saved",
  variant: "success",
  durationMs: 3000,
});
```

`showToast()` silently does nothing if the toast element does not exist in the DOM.

### Markup

```html
<div id="app-toast" class="app-toast" role="status" aria-live="polite"></div>
```

State classes applied by JS: `visible`, `success`, `error`, `info`

---

## Alert (Inline)

### API

```ts
import { bindAlert, type AlertOptions, type AlertHandle } from "@goblin-systems/goblin-design-system";

const alert = bindAlert({
  el: document.getElementById("my-alert")!,
  onDismiss: () => console.log("dismissed"),
  duration: 5000, // auto-dismiss after 5 s; omit for manual only
});

alert.dismiss();
alert.destroy();
```

`bindAlert()` sets `html[data-js="true"]`, which reveals `.alert-dismiss` via CSS (progressive enhancement). `dismiss()` sets `hidden` on the element.

### Markup

```html
<div id="my-alert" class="alert alert-info">
  <span class="alert-icon"><i data-lucide="info"></i></span>
  <span class="alert-message">Informational message here.</span>
  <button class="alert-dismiss icon-btn icon-btn-sm" aria-label="Dismiss">
    <i data-lucide="x"></i>
  </button>
</div>

<div class="alert alert-success">...</div>
<div class="alert alert-warning">...</div>
<div class="alert alert-error">...</div>
```

Classes: `alert`, `alert-info`, `alert-success`, `alert-warning`, `alert-error`, `alert-icon`, `alert-message`, `alert-dismiss`

---

## Popover

### API

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

`bindPopover()` appends the popover to `document.body` and writes `data-placement`.

Handle: `open()`, `close()`, `toggle()`, `destroy()`

### Markup

```html
<button id="popover-btn" class="secondary-btn">Open</button>

<div id="popover-card" class="popover">
  <div class="popover-title">Quick action</div>
  <div>Body content</div>
</div>
```

Classes: `popover`, `popover-title`, `is-open`  
Dataset applied by JS: `data-placement`

---

## Context Menu

### API

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

`bindContextMenu()` creates and owns the menu DOM, reusing nav dropdown styles.

Handle: `open(x, y)`, `close()`, `destroy()`

### Classes (injected by JS)

`context-menu`, `nav-dropdown`, `nav-option`, `nav-option--disabled`, `nav-option-icon`, `nav-option-label`, `nav-option-shortcut`, `nav-divider`, `is-open`

---

## Tooltip

### API

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

Binds every `[data-tooltip]` element within `root`. Uses `data-tooltip-placement` when present and flips when needed.

### Markup

```html
<button data-tooltip="Refresh dataset" data-tooltip-placement="bottom">
  <i data-lucide="refresh-cw"></i>
</button>
```

Attributes: `data-tooltip`, `data-tooltip-placement`, `data-tooltip-visible` (set by JS), `data-tooltip-side` (set by JS)
