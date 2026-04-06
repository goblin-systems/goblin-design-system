# Inputs & Controls

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
