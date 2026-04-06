# Data Display

## Table

### API

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
  selectable: "multi",       // "single" | "multi" | false (default false)
  onSelectionChange: (indices) => console.log(indices),
  resizable: true,           // default false
});

table.getSort();
table.getSelection();
table.setSelection([0, 2]);
```

- Sortable headers use `.table-sortable` on `<th>` inside `<thead>`
- Sorting cycles `asc → desc → none`
- Row selection: click-to-select with `.is-selected`; multi supports Shift+click (range) and Ctrl/Cmd+click (toggle)
- Keyboard: Arrow keys move rows, Enter/Space toggle selection
- `bindTable()` with selection sets `aria-selected` on rows, `aria-multiselectable` on the table in multi mode
- Resizable columns: drag handles appear on `.table-resizable` header cells when `resizable: true`

Handle: `getSort()`, `getSelection()`, `setSelection(indices)`, `destroy()`

### Markup

```html
<table id="my-table" class="table table-sticky">
  <thead>
    <tr>
      <th class="table-sortable table-resizable">Name</th>
      <th class="table-sortable table-resizable">Size</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Banner.png</td><td>2.4 MB</td></tr>
  </tbody>
</table>
```

Classes: `table`, `table-compact`, `table-sticky`, `table-sortable`, `table-resizable`, `table-resizer` (injected), `table-resizing` (active drag), `sort-asc`, `sort-desc`, `is-selected`

---

## Tree

### API

```ts
import {
  bindTree,
  bindCheckboxTree,
  type TreeHandle,
  type TreeOptions,
  type CheckboxTreeOptions,
} from "@goblin-systems/goblin-design-system";

const tree = bindTree({
  el: document.getElementById("my-tree")!,
});

tree.expandAll();
tree.collapseAll();
```

`bindTree()` sets `role="treeitem"`, `role="group"`, `aria-expanded`, `aria-level`, `aria-setsize`, `aria-posinset`, and implements roving tabindex for keyboard navigation.

Handle: `expand(item)`, `collapse(item)`, `expandAll()`, `collapseAll()`, `destroy()`

### Markup

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

Classes: `tree`, `tree-item`, `tree-row`, `tree-toggle`, `tree-leaf`, `tree-branch`, `is-open`

Status dot variants: `tree--dot-right`, `tree--dot-left`

---

## Accordion

### API

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

`bindAccordion()` wires ARIA ids for `.accordion-trigger` and `.accordion-panel`.

Handle: `open(itemEl)`, `close(itemEl)`, `toggle(itemEl)`, `destroy()`

### Markup

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

Classes: `accordion`, `accordion-item`, `accordion-trigger`, `accordion-panel`, `is-open`

---

## Badges & Status

```html
<span class="badge default">Stable</span>
<span class="badge beta">Beta</span>
<span class="badge success">Ready</span>
<span class="badge error">Failed</span>
<span class="badge warning">Caution</span>

<div class="status-row">
  <span class="status-indicator connected">
    <span class="status-dot"></span>
    <span>Connected</span>
  </span>
</div>
```

Badge classes: `badge`, `default`, `beta`, `success`, `error`, `warning`

Status classes: `status-row`, `status-indicator`, `status-dot`, `connected`, `untested`, `disconnected`, `error`

---

## Rich List

```html
<ul class="list">
  <li class="list-item">
    <span class="list-item-icon"><i data-lucide="file"></i></span>
    <div class="list-item-text">
      <span>Primary label</span>
      <span class="list-item-secondary">Secondary text</span>
    </div>
    <div class="list-item-action">
      <button class="icon-btn icon-btn-sm"><i data-lucide="x"></i></button>
    </div>
  </li>
  <li class="list-divider"></li>
</ul>
```

Classes: `list`, `list-item`, `list-item-icon`, `list-item-text`, `list-item-secondary`, `list-item-action`, `list-divider`, `is-selected`

---

## Stats & Empty State

```html
<div class="stat-grid">
  <div class="stat-card"><span>Items</span><strong>12</strong></div>
  <div class="stat-card"><span>Errors</span><strong>0</strong></div>
</div>

<div class="empty-state">
  <div class="empty-state-card">No data available</div>
</div>
```

Classes: `stat-grid`, `stat-card`, `empty-state`, `empty-state-card`
