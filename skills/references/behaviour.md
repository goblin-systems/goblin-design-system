# Behaviour Notes & Consumer Guidance

## Behaviour Notes

- `style.css` is required for the package to look correct
- `applyIcons()` only affects icon placeholders already in the DOM; call it again after injecting HTML
- `createIcon()` returns `null` for unknown icon names
- `byId()` and `qs()` throw when elements are missing
- `bindTabs()` manages `.is-active`, `hidden`, ARIA roles (`tablist`, `tab`, `tabpanel`), `aria-selected`, `aria-controls`, `aria-labelledby`, and roving tabindex on triggers
- `.search-suggestions` must live inside the same `.search-field` as the bound input
- `showToast()` silently does nothing if the toast element does not exist
- `bindRange()` expects the documented child structure to exist
- `bindRange().setValue()` updates the UI but does not call `onChange`
- Inverted range UI requires `.range-fill-end`
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
- `bindTree()` sets `role="treeitem"`, `role="group"`, `aria-expanded`, `aria-level`, `aria-setsize`, `aria-posinset`, and implements roving tabindex for keyboard navigation
- `bindTable()` with selection sets `aria-selected` on rows, `aria-multiselectable` on the table in multi mode, and adds keyboard row navigation (ArrowUp/Down, Enter/Space)
- `bindContextMenu()` creates and owns the menu DOM
- `setupWindowControls()` is only for Tauri apps
- `setupContextMenuGuard()` disables right-click and keyboard context-menu shortcuts globally
- `drawWaveform()` is low-level canvas drawing; the caller owns animation, clearing, sizing, and DPR handling
- `bindAlert()` sets `html[data-js="true"]` as a one-time side effect, revealing all `.alert-dismiss` buttons on the page
- Progress Bar, Spinner, Skeleton, Chip, Divider, and Avatar are CSS-only — no JS binding required

## Consumer Guidance

- Prefer the documented class names and structure exactly as shown
- Keep behaviour headless and markup-driven
- Use CSS custom properties instead of hardcoded colours
- Prefer `data-theme` token overrides over selector-specific visual overrides
- Built-in theme switching should not require app-local overrides for design-system-owned visuals
- Do not introduce rounded corners when extending the system
