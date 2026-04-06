# Feedback & Status Indicators

All components in this file are CSS-only — no JS binding required.

---

## Progress Bar

Set `--progress` to drive the fill width. Add `indeterminate` for an animated unknown-progress state.

```html
<!-- Determinate -->
<div class="progress-bar" style="--progress: 65%">
  <div class="progress-fill"></div>
</div>

<!-- Indeterminate -->
<div class="progress-bar indeterminate">
  <div class="progress-fill"></div>
</div>
```

Classes: `progress-bar`, `progress-fill`, `indeterminate`  
Custom property: `--progress` (default `0%`)

---

## Spinner

Inline loading indicator. Place inside buttons, panels, or anywhere inline.

```html
<span class="spinner"></span>
<span class="spinner spinner-sm"></span>
<span class="spinner spinner-md"></span>
<span class="spinner spinner-lg"></span>
<span class="spinner spinner-muted"></span>
<span class="spinner spinner-inherit"></span>
```

Classes:

- `spinner` — default 18 px, accent colour
- `spinner-sm` — 13 px
- `spinner-md` — 18 px
- `spinner-lg` — 26 px
- `spinner-muted` — text-muted colour
- `spinner-inherit` — inherits parent colour

---

## Skeleton / Shimmer

Loading placeholder with animated shimmer.

```html
<!-- Generic block -->
<span class="skeleton" style="width: 120px; height: 14px;"></span>

<!-- Text lines -->
<span class="skeleton-text" style="width: 80%;"></span>
<span class="skeleton-text" style="width: 60%;"></span>

<!-- Circle (e.g. avatar placeholder) -->
<span class="skeleton-circle" style="--size: 40px;"></span>
```

Classes:

- `skeleton` — block, min-height 16 px
- `skeleton-text` — 12 px high; adjacent lines get auto gap via sibling selector
- `skeleton-circle` — circle; default 32 px, override with `--size`

---

## Chip / Tag

Inline labels for filters, selections, and categorisation.

```html
<span class="chip">Label</span>
<span class="chip chip-accent">Accent</span>
<span class="chip is-selected">Selected</span>
<span class="chip" aria-disabled="true">Disabled</span>

<!-- Removable -->
<span class="chip">
  Tag name
  <button class="chip-remove" aria-label="Remove"><i data-lucide="x"></i></button>
</span>
```

Classes: `chip`, `chip-accent`, `is-selected`, `is-disabled` / `aria-disabled="true"`, `chip-remove`

---

## Divider

```html
<!-- Horizontal rule -->
<hr class="divider" />

<!-- With centred label -->
<div class="divider"><span class="divider-label">OR</span></div>

<!-- Vertical (inside a flex row) -->
<div class="divider-vertical"></div>
```

Classes: `divider` (works on `<hr>` or `<div>`), `divider-vertical`, `divider-label`

---

## Avatar

User avatar with image or initials fallback.

```html
<!-- Photo -->
<div class="avatar avatar-md"><img src="user.jpg" alt="Jane Doe" /></div>

<!-- Initials fallback -->
<div class="avatar avatar-md">JD</div>
```

Classes:

- `avatar`
- `avatar-sm` — 24 px
- `avatar-md` — 32 px
- `avatar-lg` — 48 px
