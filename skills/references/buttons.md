# Buttons

## Markup

```html
<!-- Text buttons -->
<button class="secondary-btn">Label</button>
<button class="secondary-btn slim-btn">Small</button>
<button class="secondary-btn help-btn">?</button>

<!-- Icon-only buttons -->
<button class="icon-btn"><i data-lucide="search"></i></button>
<button class="icon-btn icon-btn-sm"><i data-lucide="x"></i></button>
<button class="icon-btn icon-btn-md"><i data-lucide="search"></i></button>
<button class="icon-btn icon-btn-lg"><i data-lucide="plus"></i></button>

<!-- Active state -->
<button class="secondary-btn is-active">Active</button>

<!-- Disabled -->
<button class="secondary-btn" disabled>Disabled</button>
```

## Classes

- `secondary-btn` — standard text/label button
- `slim-btn` — reduced padding variant
- `help-btn` — small square `?` button
- `icon-btn` — icon-only, default size
- `icon-btn-sm` — 26 px square
- `icon-btn-md` — 32 px square
- `icon-btn-lg` — 40 px square
- `is-active` — highlighted active state

## Loading State

Add `.is-loading` to any `secondary-btn` or `icon-btn`. No HTML changes required — the spinner is rendered via a CSS `::after` pseudo-element.

```html
<button class="secondary-btn is-loading">Save</button>
<button class="icon-btn icon-btn-md is-loading"><i data-lucide="upload"></i></button>
```

- Pointer events are disabled while loading
- Button dimensions are preserved (text hidden via `color: transparent`, children via `opacity: 0`)
- Respects `prefers-reduced-motion`

## Button Group (Toggle Group)

See `inputs.md` → Toggle Group for grouped segmented buttons.
