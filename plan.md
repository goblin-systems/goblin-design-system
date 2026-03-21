# Goblin Design System Handoff

## Goal

Create a new standalone project at `goblin-design-system/` that serves two roles:

1. A reusable design system and UI library for the Goblin desktop apps.
2. A runnable Tauri demo app that can be launched with `bun run tauri dev` to inspect all reusable elements, components, layouts, states, and behaviors.

Do not modify `prompt-goblin/` or `vision-goblin/` yet. Build the design system in a way that those apps can later consume it as a dependency.

---

## Repository Context

Current workspace root: `C:\dev\goblin`

Projects currently present:

- `prompt-goblin/`
- `vision-goblin/`
- `goblin-design-system/` (currently empty)

Relevant facts:

- Both existing apps use:
  - Tauri 2
  - Rust
  - Vite
  - TypeScript
  - Bun
- Both use frameless custom window chrome and imperative DOM-based frontend code.
- Neither app currently uses a framework like React/Vue/Svelte.
- Shared visual language already exists, but is duplicated rather than centralized.

---

## Main Product Direction

`goblin-design-system` should be built as:

- a Tauri + Vite + TypeScript app
- runnable via `bun run tauri dev`
- containing a demo browser of:
  - tokens
  - foundations
  - controls
  - cards
  - forms
  - feedback states
  - navigation
  - split-pane workspace shell
  - waveform component
  - transparent overlay HUD

It should also expose reusable source files in a structure that future apps can import.

---

## What Was Learned From `vision-goblin`

### Project structure

Important files:

- `vision-goblin/package.json`
- `vision-goblin/vite.config.ts`
- `vision-goblin/index.html`
- `vision-goblin/src/main.ts`
- `vision-goblin/src/styles.css`
- `vision-goblin/src/settings.ts`
- `vision-goblin/src/window-controls.ts`
- `vision-goblin/src-tauri/Cargo.toml`
- `vision-goblin/src-tauri/tauri.conf.json`
- `vision-goblin/src-tauri/src/lib.rs`
- `vision-goblin/src-tauri/src/main.rs`

### Architecture summary

- Single-window Tauri desktop shell.
- Plain HTML + global CSS + imperative TypeScript.
- No component framework.
- Rust side is intentionally minimal.
- Frontend persistence uses Tauri store plugin.
- Main value for extraction is visual system, shell layout, and small UI mechanics.

### Strong reusable patterns found

#### Tokens and base styling

In `vision-goblin/src/styles.css:1`

Shared token categories already present:

- colors
- text colors
- accents
- success/warning
- radius scale
- main font
- mono font

#### Window shell and frame

In `vision-goblin/index.html:11` and `vision-goblin/src/styles.css:90`

Reusable parts:

- app shell container
- custom drag region row
- title/subtitle zone
- window action button cluster

#### Navigation

In `vision-goblin/index.html:23` and `vision-goblin/src/styles.css:183`

Reusable parts:

- pill tabs
- tab active state
- panel show/hide pattern

#### Card and panel surfaces

In `vision-goblin/src/styles.css:220`

Reusable parts:

- `settings-section`
- `mini-panel`
- section headings
- inset highlight + shadow treatment

#### Buttons and controls

In `vision-goblin/src/styles.css:134`

Reusable parts:

- `icon-btn`
- `secondary-btn`
- `slim-btn`
- hover/focus treatment
- monospace utility control style

#### Workspace shell

In `vision-goblin/index.html:46` and `vision-goblin/src/styles.css:319`

Reusable parts:

- split-pane editor shell
- left and right sidebars
- center content pane
- resizer rails
- collapsible panel behavior
- status bar

#### Utility atoms

In `vision-goblin/src/styles.css:272`, `vision-goblin/src/styles.css:248`, `vision-goblin/src/styles.css:688`

Reusable parts:

- badges
- hints
- toast
- stat cards
- checkbox rows
- field blocks
- compact lists
- stacked actions

### Reusable behaviors found

In `vision-goblin/src/main.ts`

Useful behavior patterns:

- toast rendering: `vision-goblin/src/main.ts:102`
- tab switching: `vision-goblin/src/main.ts:117`
- document tab rendering: `vision-goblin/src/main.ts:127`
- shell preference application: `vision-goblin/src/main.ts:201`
- resizable split panes: `vision-goblin/src/main.ts:462`

### What should NOT be extracted from Vision Goblin

Keep local to that app later:

- editor document model
- layers/history semantics
- tool names and tool copy
- canvas mock visuals specific to image editing
- app-specific settings schema
- `vision-goblin:*` custom events
- product copy like "Phase 1 foundation"

Relevant files:

- `vision-goblin/src/main.ts`
- `vision-goblin/src/settings.ts`
- `vision-goblin/index.html`

---

## What Was Learned From `prompt-goblin`

### Project structure

Important files:

- `prompt-goblin/package.json`
- `prompt-goblin/vite.config.ts`
- `prompt-goblin/index.html`
- `prompt-goblin/overlay.html`
- `prompt-goblin/src/styles.css`
- `prompt-goblin/src/overlay-styles.css`
- `prompt-goblin/src/app.ts`
- `prompt-goblin/src/main.ts`
- `prompt-goblin/src/main/dom.ts`
- `prompt-goblin/src/main/window-controls.ts`
- `prompt-goblin/src/settings.ts`
- `prompt-goblin/src/waveform-styles.ts`
- `prompt-goblin/src/overlay.ts`
- `prompt-goblin/src-tauri/Cargo.toml`
- `prompt-goblin/src-tauri/tauri.conf.json`
- `prompt-goblin/src-tauri/src/lib.rs`
- `prompt-goblin/src-tauri/src/main.rs`

### Architecture summary

- Two-window Tauri app:
  - main settings window
  - transparent overlay window
- Plain HTML + CSS + TypeScript.
- DOM access and UI rendering are split more cleanly than Vision Goblin.
- There is a reusable waveform rendering system already separated in TypeScript.
- Tauri side is much more app-specific due to tray/audio/shortcut/invoke behavior.

### Strong reusable patterns found

#### Shared token base

In `prompt-goblin/src/styles.css:2`

Contains reusable tokens for:

- background
- section surfaces
- inputs
- borders
- focus state
- text hierarchy
- badges
- radii
- fonts

#### Card/settings shell

In `prompt-goblin/src/styles.css:46`, `prompt-goblin/src/styles.css:96`

Reusable parts:

- constrained settings container
- section cards
- title row
- section heading rows

#### Form system

In `prompt-goblin/src/styles.css:125`

Reusable parts:

- field rows
- text/password/number inputs
- selects
- button styling
- inline fields
- language grid
- range row treatment
- help icon buttons

#### Feedback system

In `prompt-goblin/src/styles.css:317`, `prompt-goblin/src/styles.css:402`, `prompt-goblin/src/styles.css:501`, `prompt-goblin/src/styles.css:592`

Reusable parts:

- status indicator
- status dot states
- badges
- toast
- modal backdrop/card/header/list

#### Checkbox/radio patterns

In `prompt-goblin/src/styles.css:371`

Reusable parts:

- checkbox row
- radio row
- hover treatment
- inline badge placement

#### Overlay system

In `prompt-goblin/overlay.html:11` and `prompt-goblin/src/overlay-styles.css:22`

Reusable parts:

- overlay pill container
- animated recording dot
- timer label
- debug HUD row
- transcript preview
- transparent window styling

#### Waveform component

In `prompt-goblin/src/waveform-styles.ts:1`

This is a major extraction candidate.

It already contains:

- waveform style enums
- color scheme enums
- palette definitions
- labels
- type guards
- cycle helpers
- drawing logic

This should move almost directly into the design system.

### Reusable DOM helpers found

In `prompt-goblin/src/main/dom.ts`

Good generic headless helper patterns:

- required/optional element resolution
- select option population
- connection/status updates
- typing hint updates
- enabled/disabled state coordination

Important references:

- `prompt-goblin/src/main/dom.ts:58`
- `prompt-goblin/src/main/dom.ts:71`
- `prompt-goblin/src/main/dom.ts:191`
- `prompt-goblin/src/main/dom.ts:220`
- `prompt-goblin/src/main/dom.ts:229`
- `prompt-goblin/src/main/dom.ts:254`

### What should NOT be extracted from Prompt Goblin

Keep out of the design system:

- STT provider logic
- audio monitoring/recording
- model fetch logic
- transcript correction logic
- typing automation
- tray behavior
- app-specific settings schema
- provider-specific text and modal copy
- debug log business logic

Keep these out of extraction:

- `prompt-goblin/src/app.ts`
- `prompt-goblin/src/settings.ts`
- `prompt-goblin/src/stt/**`
- `prompt-goblin/src/correction/**`
- `prompt-goblin/src/text-commands.ts`
- `prompt-goblin/src-tauri/src/lib.rs`

---

## Shared Cross-App Conclusions

### Reuse is strongest in these layers

1. Design tokens
2. Global base styling
3. Surface/card primitives
4. Buttons and form controls
5. Status/badge/toast/modal primitives
6. Window frame and custom Tauri controls
7. Tab and split-pane shell patterns
8. Overlay HUD
9. Waveform rendering
10. Small headless DOM helpers

### Reuse is weakest in these layers

1. Product state models
2. App-specific settings types
3. Domain logic
4. Rust invoke commands
5. Feature copy and labels
6. Demo data and semantics

---

## Recommended Build Strategy

### Core principle

Build `goblin-design-system` as a standalone app first, but organize it like a consumable package.

### Proposed structure

```text
goblin-design-system/
  package.json
  bun.lock
  tsconfig.json
  vite.config.ts
  index.html
  overlay.html
  src/
    main.ts
    overlay.ts
    app.css
    lib/
      tokens.css
      base.css
      platform/
        tauri-window.ts
      headless/
        dom.ts
        toast.ts
        modal.ts
        tabs.ts
        split-pane.ts
      primitives/
        buttons.ts
        fields.ts
        badges.ts
        status.ts
        toast.ts
        modal.ts
      composites/
        window-frame.ts
        section-card.ts
        top-tabs.ts
        split-workspace.ts
        overlay-hud.ts
        waveform-panel.ts
      waveform/
        waveform.ts
      index.ts
    demo/
      data.ts
      main-demo.ts
      overlay-demo.ts
      sections/
        foundations.ts
        buttons.ts
        forms.ts
        feedback.ts
        navigation.ts
        workspace.ts
        overlay.ts
    assets/
      ...
  src-tauri/
    Cargo.toml
    tauri.conf.json
    src/
      lib.rs
      main.rs
```

---

## Recommended Tauri Setup

### Base the new project mostly on `vision-goblin`

Use as baseline references:

- `vision-goblin/package.json`
- `vision-goblin/vite.config.ts`
- `vision-goblin/src-tauri/Cargo.toml`
- `vision-goblin/src-tauri/src/lib.rs`
- `vision-goblin/src-tauri/src/main.rs`
- `vision-goblin/src-tauri/tauri.conf.json`

Reason:

- it is minimal
- it already supports the Tauri store plugin
- it avoids app-specific business logic

### But include a second overlay window like `prompt-goblin`

Reference:

- `prompt-goblin/src-tauri/tauri.conf.json`

Need to add a second window for:

- `overlay.html`
- transparent background
- always-on-top
- non-taskbar visibility
- demoing the HUD in a realistic environment

### Rust side recommendation

Start with minimal Rust:

- store plugin only
- no tray
- no audio
- no shortcuts
- no business-specific invoke commands

If needed, add only tiny helpers for demo window controls later.

---

## Demo App Requirements

The demo should let another developer inspect reusable UI without reading source first.

### Main demo window should include

#### Foundations

- color tokens
- typography samples
- radius scale
- shadow and surface samples
- spacing examples
- motion examples

#### Primitives

- button variants
- icon button variants
- badge variants
- status indicator states
- hint text
- cards and panels
- inputs
- selects
- checkboxes
- radio rows
- range inputs

#### Feedback

- toast success/error/info
- modal open/close
- disabled states
- empty state block

#### Navigation and shell

- top tabs
- window frame
- document tab style
- split-pane layout
- status bar
- stacked actions

#### Waveform

- all waveform styles
- all waveform color schemes
- animated live preview
- cycling controls

#### Overlay

- open/close overlay window
- change overlay state
- switch waveform style
- switch color scheme
- toggle transcript preview
- toggle debug HUD

---

## Extraction Targets

### Extract first

#### 1. Tokens

Primary sources:

- `prompt-goblin/src/styles.css:2`
- `vision-goblin/src/styles.css:1`

Create a merged token source in `src/lib/tokens.css`.

This should include:

- color palette
- semantic colors
- text hierarchy
- border/focus colors
- radii
- font stacks
- shadows
- spacing scale
- animation timing
- scrollbar tokens

#### 2. Base CSS

Merge the shared reset/base behavior from:

- `prompt-goblin/src/styles.css`
- `vision-goblin/src/styles.css`
- `prompt-goblin/src/overlay-styles.css`

Include:

- reset
- body backgrounds
- common typography
- focus states
- scrollbars
- selection/user-select defaults

#### 3. Waveform system

Source:

- `prompt-goblin/src/waveform-styles.ts`

Extract almost directly, possibly renaming to:

- `src/lib/waveform/waveform.ts`

#### 4. Window controls adapter

Sources:

- `vision-goblin/src/window-controls.ts`
- `prompt-goblin/src/main/window-controls.ts`

Create a generic Tauri adapter that wires:

- minimize
- close
- optional drag helpers
- optional modal escape behavior

#### 5. Headless DOM utilities

Source:

- `prompt-goblin/src/main/dom.ts`

Extract generic parts only.

---

## Components To Build

### Primitives

- `Button`
- `IconButton`
- `Badge`
- `HintText`
- `StatusIndicator`
- `TextField`
- `PasswordField`
- `NumberField`
- `SelectField`
- `RangeField`
- `CheckboxRow`
- `RadioRow`
- `Toast`
- `Modal`
- `SurfaceCard`

### Composites

- `WindowFrame`
- `SectionCard`
- `TopTabs`
- `DocumentTabs`
- `SplitWorkspace`
- `StatusBar`
- `OverlayHud`
- `WaveformPreviewPanel`
- `EmptyStateCard`

### Headless utilities

- `mountToast`
- `openModal`
- `closeModal`
- `bindTabs`
- `bindSplitPaneResize`
- `populateSelectOptions`
- `setStatusIndicatorState`

---

## What Future Consumption Should Look Like

Later, `prompt-goblin` and `vision-goblin` should be able to depend on this project without major architecture changes.

### Likely dependency strategy

Use Bun local dependency or workspace dependency later, for example:

- local path dependency
- or `workspace:*` if the repo becomes a workspace setup

### Likely integration style

Because both apps are plain DOM apps:

- shared CSS imports
- shared template/render helpers
- shared headless behavior utilities
- shared waveform renderer
- shared Tauri window-control adapter

### Important constraint

Do not force a framework migration.

The design system should remain consumable by plain TypeScript + DOM code.

---

## Naming Guidance

The currently existing folder is:

- `goblin-design-system/`

Unless explicitly changed by the user, continue with that singular folder/project name for consistency with what exists on disk.

---

## Technical Baseline To Mirror

### Package setup references

Use these as templates:

- `vision-goblin/package.json`
- `prompt-goblin/package.json`

### TypeScript config references

- `vision-goblin/tsconfig.json`
- `prompt-goblin/tsconfig.json`

### Vite config references

- `vision-goblin/vite.config.ts`
- `prompt-goblin/vite.config.ts`

### Tauri config references

- `vision-goblin/src-tauri/tauri.conf.json`
- `prompt-goblin/src-tauri/tauri.conf.json`

---

## Suggested Implementation Order

### Phase 1 - Project bootstrap

1. Scaffold `goblin-design-system` package files.
2. Add Tauri config and minimal Rust entrypoint.
3. Add Vite setup with main and overlay HTML entries.
4. Confirm `bun run tauri dev` launches.

### Phase 2 - Foundations

1. Create merged `tokens.css`.
2. Create `base.css`.
3. Normalize background, typography, scrollbar, and focus styles.
4. Build foundations demo page.

### Phase 3 - Primitives

1. Extract buttons.
2. Extract fields and form rows.
3. Extract badges and status indicators.
4. Extract toast and modal.
5. Add demo interactions.

### Phase 4 - Layout and shell

1. Build `WindowFrame`.
2. Build `TopTabs`.
3. Build `SectionCard`.
4. Build `SplitWorkspace`.
5. Build `StatusBar`.
6. Add responsive behavior.

### Phase 5 - Waveform and overlay

1. Extract waveform renderer from Prompt Goblin.
2. Build waveform preview panel.
3. Build real transparent overlay demo window.
4. Add overlay controls in main demo.

### Phase 6 - Handover readiness

1. Ensure exports are clean under `src/lib/index.ts`.
2. Keep demo code separate from library code.
3. Document import examples for future app adoption.
4. Verify build and Tauri dev flow.

---

## Verification Checklist

The implementing agent should verify:

- `bun install`
- `bun run build`
- `bun run tauri dev`

And manually check:

- main demo window renders
- overlay window renders
- tabs switch correctly
- toasts animate correctly
- modal opens/closes
- split pane resizes
- status indicator states render
- waveform styles cycle
- overlay waveform animates
- mobile/narrow-width layout remains usable

---

## Risks / Caveats

### 1. Existing apps are not truly componentized

The reusable material is mostly CSS and DOM patterns, not ready-made reusable TS modules.

### 2. Prompt and Vision share style language by duplication

The first real job is consolidation, not extraction of already-clean modules.

### 3. Overlay styling currently has a separate token world

`prompt-goblin/src/overlay-styles.css` should be normalized onto the same token system as the main surfaces.

### 4. Avoid accidental product coupling

Do not move app-specific settings schemas or business logic into the design system.

### 5. Keep the design system demo-driven

A runnable Tauri showcase is required, not just a library folder.

---

## File Reference Index

### Vision Goblin

- `vision-goblin/package.json`
- `vision-goblin/vite.config.ts`
- `vision-goblin/tsconfig.json`
- `vision-goblin/index.html`
- `vision-goblin/src/main.ts`
- `vision-goblin/src/styles.css`
- `vision-goblin/src/settings.ts`
- `vision-goblin/src/window-controls.ts`
- `vision-goblin/src-tauri/Cargo.toml`
- `vision-goblin/src-tauri/tauri.conf.json`
- `vision-goblin/src-tauri/src/lib.rs`
- `vision-goblin/src-tauri/src/main.rs`

### Prompt Goblin

- `prompt-goblin/package.json`
- `prompt-goblin/vite.config.ts`
- `prompt-goblin/tsconfig.json`
- `prompt-goblin/index.html`
- `prompt-goblin/overlay.html`
- `prompt-goblin/src/styles.css`
- `prompt-goblin/src/overlay-styles.css`
- `prompt-goblin/src/main/dom.ts`
- `prompt-goblin/src/main/window-controls.ts`
- `prompt-goblin/src/settings.ts`
- `prompt-goblin/src/waveform-styles.ts`
- `prompt-goblin/src/overlay.ts`
- `prompt-goblin/src-tauri/Cargo.toml`
- `prompt-goblin/src-tauri/tauri.conf.json`
- `prompt-goblin/src-tauri/src/lib.rs`
- `prompt-goblin/src-tauri/src/main.rs`

### New target

- `goblin-design-system/`

---

## Final Build Intent

The end result should be a standalone, inspectable, reusable Goblin UI system that captures the shared language already visible across Prompt Goblin and Vision Goblin, while staying neutral enough that both apps can later adopt it incrementally.
