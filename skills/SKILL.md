---
name: goblin-design-system
description: Documents the Goblin Design System package, including all public exports, CSS classes, markup patterns, design tokens, and usage constraints. Use when working with `@goblin-systems/goblin-design-system` or when building UI that should follow its square, vanilla TypeScript patterns.
---

# Goblin Design System

Package: `@goblin-systems/goblin-design-system`  
Peer deps: `lucide` (required), `@tauri-apps/api` (optional, Tauri only)

**Dark theme · Square corners · Vanilla TS/JS · CSS classes = appearance · TS functions = behaviour**

Full details for each group are in `skills/references/`. Read the relevant file before generating code.

---

## Reference Index

| Group | What's included | File |
|---|---|---|
| **Setup** | Install, bootstrap, design rules | `references/setup.md` |
| **Tokens & Themes** | CSS tokens, built-in themes (`goblin`/`dark`/`light`), theme API | `references/tokens.md` |
| **Icons & DOM** | `applyIcons`, `createIcon`, `byId`, `qs`, `populateSelectOptions` | `references/icons.md` |
| **Buttons** | `secondary-btn`, `icon-btn`, sizes, loading state (`.is-loading`) | `references/buttons.md` |
| **Navigation** | Menu bar, tabs, document tabs, stepper, pagination, breadcrumbs, window shell | `references/navigation.md` |
| **Overlays** | Modal, drawer, toast, alert, popover, context menu, tooltip | `references/overlays.md` |
| **Forms** | Native inputs, field helpers, switch, custom select, multi-select, text field, transfer list, rating, radio/checkbox groups | `references/forms.md` |
| **Inputs & Controls** | Range slider, radial dial, toggle group, search, date picker / date range picker | `references/inputs.md` |
| **Data Display** | Table, tree, accordion, badges, status indicators, rich list, stats, empty state | `references/data-display.md` |
| **Feedback** | Progress bar, spinner, skeleton/shimmer, chip/tag, divider, avatar | `references/feedback.md` |
| **Layout** | Split pane, scroll panel, settings section, mini panel, stack/row utilities, status bar | `references/layout.md` |
| **Waveform** | Canvas waveform API, waveform panel, overlay pill / recording UI | `references/waveform.md` |
| **Tauri** | `setupWindowControls`, `setupContextMenuGuard` | `references/tauri.md` |
| **Behaviour & Guidance** | All behaviour gotchas, consumer rules | `references/behaviour.md` |
