# Forms

## Native Form Elements

Styled automatically from `base.css` — no extra classes needed:

```html
<input type="text" placeholder="..." />
<input type="password" />
<input type="number" />
<select><option>...</option></select>
<input type="checkbox" />
<input type="radio" name="g" />
<input type="range" min="0" max="100" value="50" />
<textarea></textarea>
```

To animate native range fill, keep `--_pct` in sync:

```ts
function syncFill(input: HTMLInputElement) {
  const pct = ((+input.value - +input.min) / (+input.max - +input.min)) * 100;
  input.style.setProperty("--_pct", `${pct}%`);
}
```

---

## Field Helpers

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

Classes: `field`, `field-block`, `inline-field`, `language-grid`, `language-field`, `unit`

---

## Text Field

### API

```ts
import {
  bindTextField,
  type TextFieldHandle,
  type TextFieldOptions,
  type ValidationResult,
} from "@goblin-systems/goblin-design-system";
```

---

## Radio and Checkbox Groups

```html
<div class="radio-group">
  <label class="radio-label"><input type="radio" name="mode" /> One</label>
  <label class="checkbox-label"><input type="checkbox" /> Enabled</label>
</div>
```

Classes: `radio-group`, `radio-label`, `checkbox-label`

---

## Switch

### API

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

`bindSwitch()` expects an `input[type="checkbox"]` inside `.switch`.

Handle: `getValue()`, `setValue(checked)`, `destroy()`

### Markup

```html
<label id="my-switch" class="switch">
  <input type="checkbox" />
  <span class="switch-track"><span class="switch-thumb"></span></span>
  <span class="switch-label">Auto-correct</span>
</label>
```

Classes: `switch`, `switch-track`, `switch-thumb`, `switch-label`

---

## Custom Select

### API

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

`bindSelect()` expects `.custom-select-native`, `.custom-select-trigger`, and `.custom-select-list`. Adds `.is-enhanced` and hides the native `<select>` from tab order.

Handle: `getValue()`, `setValue(value)`, `open()`, `close()`, `destroy()`

### Markup

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

Classes: `custom-select`, `custom-select-native`, `custom-select-trigger`, `custom-select-list`, `custom-select-search`, `custom-select-group`, `custom-select-group-label`, `custom-select-option`, `custom-select-option-icon`, `is-enhanced`, `is-open`, `is-active`, `is-selected`

---

## Multi-Select

### API

```ts
import {
  bindMultiSelect,
  type MultiSelectHandle,
  type MultiSelectOption,
  type MultiSelectOptions,
} from "@goblin-systems/goblin-design-system";
```

---

## Transfer List

### API

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

`bindTransferList()` expects `data-transfer-list` and `data-transfer-action` hooks exactly as shown.

Handle: `getLeft()`, `getRight()`, `destroy()`

### Markup

```html
<div id="my-transfer-list" class="transfer-list">
  <div class="transfer-list-column">
    <div class="transfer-list-items" data-transfer-list="left">
      <button type="button" class="transfer-list-item" data-value="title">Title</button>
    </div>
  </div>
  <div class="transfer-list-actions">
    <button class="secondary-btn slim-btn" data-transfer-action="to-right">&gt;</button>
    <button class="secondary-btn slim-btn" data-transfer-action="all-right">&gt;&gt;</button>
    <button class="secondary-btn slim-btn" data-transfer-action="to-left">&lt;</button>
    <button class="secondary-btn slim-btn" data-transfer-action="all-left">&lt;&lt;</button>
  </div>
  <div class="transfer-list-column">
    <div class="transfer-list-items" data-transfer-list="right"></div>
  </div>
</div>
```

Classes/attributes: `transfer-list`, `transfer-list-column`, `transfer-list-items`, `transfer-list-item`, `transfer-list-actions`, `is-selected`, `data-transfer-list="left|right"`, `data-transfer-action="to-right|all-right|to-left|all-left"`

---

## Rating

### API

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

`bindRating()` treats the root as a slider and toggles `.is-active` on `.rating-star`.

Handle: `getValue()`, `setValue(value)`, `destroy()`

### Markup

```html
<div id="my-rating" class="rating" data-rating-value="3" aria-label="Rating input">
  <button class="rating-star" type="button"><i data-lucide="star"></i></button>
  <button class="rating-star" type="button"><i data-lucide="star"></i></button>
  <button class="rating-star" type="button"><i data-lucide="star"></i></button>
  <button class="rating-star" type="button"><i data-lucide="star"></i></button>
  <button class="rating-star" type="button"><i data-lucide="star"></i></button>
</div>
```

Classes: `rating`, `rating-star`, `is-active`
