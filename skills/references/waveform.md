# Waveform & Overlay UI

## Waveform (Canvas)

### API

```ts
import {
  WAVEFORM_COLOR_SCHEMES,
  WAVEFORM_STYLES,
  createWaveProgressGradient,
  cycleWaveformColorScheme,
  cycleWaveformStyle,
  drawWaveform,
  getWaveformColorSchemeLabel,
  getWaveformStyleLabel,
  isWaveformColorScheme,
  isWaveformStyle,
  type DrawWaveformOptions,
  type WaveformColorScheme,
  type WaveformStyle,
} from "@goblin-systems/goblin-design-system";
```

- `WAVEFORM_STYLES`: `classic`, `bars`, `pulse`, `bloom`, `fan`
- `WAVEFORM_COLOR_SCHEMES`: `aurora`, `ember`, `glacier`, `sunset`, `monochrome`
- `drawWaveform(style, options)` — draws one frame into a canvas context
- `createWaveProgressGradient(ctx, height, colorScheme)` — builds a vertical progress gradient
- `isWaveformStyle()` / `isWaveformColorScheme()` — validate unknown values
- `cycleWaveformStyle()` / `cycleWaveformColorScheme()` — step through available sets
- `getWaveformStyleLabel()` / `getWaveformColorSchemeLabel()` — return display labels

`drawWaveform()` is low-level canvas drawing. The caller owns animation loop, clearing, canvas sizing, and DPR handling.

### Minimal Usage

```ts
const canvas = document.querySelector("canvas")!;
const ctx = canvas.getContext("2d")!;

function frame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawWaveform("classic", {
    ctx,
    width: canvas.width,
    height: canvas.height,
    amplitude: 18,
    phase: performance.now() / 180,
    active: true,
    colorScheme: "aurora",
  });
  requestAnimationFrame(frame);
}

frame();
```

### Markup

```html
<div class="wave-panel">
  <div class="wave-canvas-wrap">
    <canvas id="wave-canvas"></canvas>
  </div>
  <div class="wave-controls">
    <span class="wave-label">Classic</span>
  </div>
</div>
```

Classes: `wave-panel`, `wave-canvas-wrap`, `wave-controls`, `wave-label`

---

## Overlay Pill (Voice / Recording UI)

CSS-only structure for voice recording and transcription overlays.

```html
<div class="overlay-pill">
  <div class="overlay-main-row">
    <span class="recording-dot listening"></span>
    <span class="overlay-label">Listening...</span>
    <span class="overlay-timer">0:00</span>
  </div>
  <div class="overlay-wave-wrap"><canvas></canvas></div>
  <div class="overlay-hud">...</div>
  <div class="overlay-transcript visible">Transcript text here</div>
</div>
```

Classes:

- `overlay-base`, `overlay-pill`
- `overlay-main-row`, `overlay-label`, `overlay-timer`
- `recording-dot` with state modifiers: `loading`, `listening`, `transcribing`, `correcting`, `done`
- `overlay-wave-wrap`
- `overlay-hud`
- `overlay-transcript`, `visible`
