# Icons & Utilities

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

---

## `bindHotkey`

Registers a keyboard shortcut and returns an unbind function.

```ts
import { bindHotkey, type HotkeyOptions } from "@goblin-systems/goblin-design-system";

const off = bindHotkey("mod+k", () => openPalette());
const off2 = bindHotkey("ctrl+shift+p", handler);
const off3 = bindHotkey("escape", close, { target: panelEl });

off(); // removes listener
```

Key syntax: modifiers separated by `+`, then the key name (case-insensitive).

Modifiers: `ctrl`, `shift`, `alt`, `meta`, `mod`  
`mod` resolves to `ctrl` on Windows/Linux and `meta` (Cmd) on macOS.

Options:

- `target` — element to attach the listener to (default `window`)
- `preventDefault` — prevent browser default for the key combo (default `true`)

---

## `bindClickOutside`

Calls a callback whenever the user clicks/taps outside a given element.

```ts
import { bindClickOutside, type ClickOutsideOptions } from "@goblin-systems/goblin-design-system";

const stop = bindClickOutside(menuEl, () => closeMenu());
stop(); // removes listener
```

Options:

- `event` — which pointer event to listen for: `"pointerdown"` (default), `"mousedown"`, or `"click"`

Uses capture phase so it fires before any `stopPropagation` inside the element.
