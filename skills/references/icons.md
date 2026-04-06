# Icons

## API

```ts
import {
  applyIcons,
  createIcon,
  ICON_SET,
  type IconNode,
} from "@goblin-systems/goblin-design-system";
```

- `applyIcons()` — replaces all `<i data-lucide="...">` placeholders currently in the DOM
- `createIcon(name)` — returns a single `SVGSVGElement | null`; returns `null` for unknown names
- `ICON_SET` — full Lucide-backed icon map used by the package
- Icon names are kebab-case: `search`, `chevron-right`, `trash-2`

## Markup

```html
<i data-lucide="search"></i>
<i data-lucide="chevron-right"></i>
<i data-lucide="trash-2"></i>
```

Call `applyIcons()` after any HTML containing icon placeholders is inserted into the DOM.

## DOM Helpers

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

- `byId<T>(id, doc?)` — throws if the element is missing
- `byIdOptional<T>(id, doc?)` — returns `null` when missing
- `qs<T>(selector, root?)` — throws if the element is missing
- `qsAll<T>(selector, root?)` — returns all matches
- `populateSelectOptions(select, options, preferred)` — replaces all `<option>` nodes, disables `<select>` when empty
- `setGroupDisabled(container, disabled)` — toggles `disabled` on child `input`, `select`, and `button` elements
