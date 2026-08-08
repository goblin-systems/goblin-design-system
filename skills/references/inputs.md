# Inputs & Controls

## Number Input

### API

```ts
import {
  bindNumberInput,
  type NumberInputHandle,
  type NumberInputOptions,
} from "@goblin-systems/goblin-design-system";

const numInput = bindNumberInput({
  el: document.getElementById("my-number-input")!,
  onChange: (value) => console.log(value),
});

numInput.getValue();
numInput.setValue(42);
numInput.destroy();
```

- Wires `.number-input-dec` and `.number-input-inc` buttons to the enclosed `<input type="number">`
- Respects `min`, `max`, and `step` attributes
- Disables each button when the value reaches its boundary
- `setValue()` clamps to `min`/`max` and calls `onChange`

Handle: `getValue()`, `setValue(value)`, `destroy()`

### Markup

```html
<div id="my-number-input" class="number-input">
  <button class="number-input-dec icon-btn icon-btn-sm" type="button">
    <i data-lucide="minus"></i>
  </button>
  <input type="number" value="5" min="0" max="100" step="1" />
  <button class="number-input-inc icon-btn icon-btn-sm" type="button">
    <i data-lucide="plus"></i>
  </button>
</div>
```

Classes: `number-input`, `number-input-dec`, `number-input-inc`

Native spin buttons are hidden via CSS. The input width is fixed at 56 px; override with inline style if needed.

---

## Slider (Single Value)

A fully custom (non-native) slider with one thumb, in horizontal or vertical
orientation. Use this instead of a native `input[type=range]` whenever you
need a vertical fader — native range inputs cannot be made reliably vertical
across browsers without fighting `appearance`/`writing-mode` quirks; this
component sidesteps that by never using a native `<input>` at all.

### API

```ts
import {
  bindSlider,
  type SliderHandle,
  type SliderOptions,
} from "@goblin-systems/goblin-design-system";

const slider = bindSlider({
  el: document.getElementById("my-slider")!,
  min: 0,
  max: 100,
  step: 1,
  value: 60,
  orientation: "vertical",   // default "horizontal"
  label: "Volume",
  onChange: (value) => console.log(value),
});

slider.setValue(80);
slider.getValue();
slider.destroy();
```

`onChange` fires continuously (drag, click-to-jump, keyboard) — the same as
`bindRange`. There is no separate "commit" event; if you need drag-preview now
but a single undo step on release, wrap it yourself (buffer the value in
`onChange`, dispatch on the container's `pointerup`/`keyup`).

Handle: `setValue(value)`, `getValue()`, `destroy()`

### Markup

```html
<!-- Horizontal (default) -->
<div id="my-slider" class="slider">
  <div class="slider-track">
    <div class="slider-fill"></div>
    <div class="slider-thumb"></div>
  </div>
</div>

<!-- Vertical: add the modifier class and give the root a height -->
<div id="my-fader" class="slider slider--vertical" style="height: 140px">
  <div class="slider-track">
    <div class="slider-fill"></div>
    <div class="slider-thumb"></div>
  </div>
</div>
```

Classes: `slider`, `slider--vertical`, `slider-track`, `slider-fill`, `slider-thumb`, `is-dragging`

Vertical reads low-to-high bottom-to-top, like a fader. The root element must
have an explicit or flex-derived height for the vertical track to have
anything to fill.

---

## Double Range Slider

### API

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

`bindRange()` expects the documented child structure to exist. `setValue()` updates the UI but does not call `onChange`. Inverted range UI requires `.range-fill-end`.

Handle: `setValue(lo, hi)`, `getValue()`, `destroy()`

### Markup

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

Classes: `range-slider`, `range-track`, `range-fill`, `range-fill-end` (inverted only), `range-thumb`, `range-labels`, `range-label-lo`, `range-label-hi`, `is-dragging`

---

## Radial Control

### API

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

`bindRadial()` expects the documented SVG child structure. Sweeps clockwise from `startAngle` to `endAngle`; identical angles mean a full circle. `setValue()` updates the UI but does not call `onChange`.

Handle: `setValue(value)`, `getValue()`, `destroy()`

### Markup

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

Classes: `radial-control`, `radial-control-sm`, `radial-control-xs`, `radial-control-visual`, `radial-control-track`, `radial-control-fill`, `radial-control-pointer`, `radial-control-thumb`, `radial-control-readout`, `radial-control-value`, `radial-control-caption`, `is-dragging`

Per-instance CSS variables: `--radial-control-fill-color`, `--radial-control-track-color`, `--radial-control-thumb-stroke`, `--radial-control-focus-ring`

---

## Toggle Group (Segmented Control)

### API

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

Handle: `getSelected()`, `setSelected(values)`, `destroy()`

JS manages `.is-active` and `aria-pressed` on each button.

### Markup

```html
<div id="my-toggle-group" class="btn-group">
  <button class="secondary-btn is-active" data-value="snap">Snap</button>
  <button class="secondary-btn" data-value="guides">Guides</button>
  <button class="secondary-btn" data-value="grid">Grid</button>
</div>
```

---

## Search

### API

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

`.search-suggestions` must live inside the same `.search-field` as the bound input.

Handle: `setSuggestions(items)`, `clearSuggestions()`, `destroy()`

### Markup

```html
<div class="search-field" style="width: 280px">
  <span class="search-field-icon"><i data-lucide="search"></i></span>
  <input id="my-search" type="text" placeholder="Search..." />
  <div class="search-suggestions"></div>
</div>
```

Classes: `search-field`, `search-field-icon`, `search-suggestions`, `search-suggestion`, `is-open`, `is-active`

---

## Date Picker / Date Range Picker

### API

```ts
import {
  bindDatePicker,
  bindDateRangePicker,
  type DatePickerHandle,
  type DatePickerOptions,
  type DateRangePickerHandle,
  type DateRangePickerOptions,
} from "@goblin-systems/goblin-design-system";

const rangePicker = bindDateRangePicker({
  startInput: document.getElementById("start") as HTMLInputElement,
  endInput: document.getElementById("end") as HTMLInputElement,
  min: "2020-01-01",
  max: "2030-12-31",
  onChange: (range) => console.log(range.start, range.end),
});

rangePicker.getValue();
rangePicker.setValue("2025-01-01", "2025-12-31");
rangePicker.destroy();
```

- First click selects start date, second selects end date
- If end < start, dates are automatically swapped
- Both inputs open the same calendar popover
- `onChange` fires only after both dates are selected

Handle: `open()`, `close()`, `getValue()`, `setValue(start, end)`, `destroy()`

### Markup

```html
<div class="date-range-picker">
  <input id="start" type="text" placeholder="Start date" />
  <input id="end" type="text" placeholder="End date" />
</div>
```

Range-specific classes applied by JS on calendar day cells: `is-range-start`, `is-range-end`, `is-in-range`

---

## File Drop Zone

### API

```ts
import {
  bindDropZone,
  type DropZoneHandle,
  type DropZoneOptions,
} from "@goblin-systems/goblin-design-system";

const zone = bindDropZone({
  el: document.getElementById("my-drop-zone")!,
  onDrop: (files) => console.log([...files]),
  accept: "image/*",   // optional MIME filter
  multiple: true,      // default true
});

zone.browse();   // programmatically open file picker
zone.destroy();
```

- Adds `.is-dragging-over` while a drag is in progress over the element
- Filters dropped files by `accept` when provided (same syntax as `<input accept>`)
- Click on the zone or a `.drop-zone-browse` button opens the native file picker
- A hidden `<input type="file">` is injected and removed on `destroy()`

Handle: `browse()`, `destroy()`

### Markup

```html
<div id="my-drop-zone" class="drop-zone">
  <i data-lucide="upload-cloud"></i>
  <p>Drop files here or <button class="text-btn drop-zone-browse" type="button">browse</button></p>
  <span class="drop-zone-hint">PNG, JPG up to 10 MB</span>
</div>
```

Classes: `drop-zone`, `drop-zone-browse` (click triggers file picker), `drop-zone-hint`, `is-dragging-over`

---

## Auto-resize Textarea

### API

```ts
import {
  bindTextarea,
  type TextareaHandle,
  type TextareaOptions,
} from "@goblin-systems/goblin-design-system";

const ta = bindTextarea({
  el: document.getElementById("my-textarea")!,  // textarea or .textarea-field container
  onChange: (value) => console.log(value),
});

ta.getValue();
ta.setValue("Hello");
ta.destroy();
```

- Textarea grows as the user types, never shrinking below its `rows` height
- If a `.textarea-count` sibling exists inside `.textarea-field`, it shows `n / max` (when `maxlength` is set) or just `n`
- Counter gains `.is-near-limit` at 90 % and `.is-at-limit` at 100 %
- Sets `overflow: hidden` and `resize: none` on the element; these are restored on `destroy()`

Handle: `getValue()`, `setValue(value)`, `destroy()`

### Markup

```html
<!-- Minimal -->
<textarea id="my-textarea" rows="3"></textarea>

<!-- With container, label, and counter -->
<div class="textarea-field">
  <label for="notes">Notes</label>
  <textarea id="notes" rows="3" maxlength="500"></textarea>
  <span class="textarea-count"></span>
</div>
```

Classes: `textarea-field`, `textarea-count`, `is-near-limit`, `is-at-limit`
