import {
  cycleWaveformStyle,
  cycleWaveformColorScheme,
  drawWaveform,
  WAVEFORM_STYLES,
  WAVEFORM_COLOR_SCHEMES,
  getWaveformStyleLabel,
  getWaveformColorSchemeLabel,
  type WaveformStyle,
  type WaveformColorScheme,
} from "./lib/waveform/waveform";

// ── State ─────────────────────────────────────────────────────────────────────
let currentStyle: WaveformStyle = WAVEFORM_STYLES[0];
let currentScheme: WaveformColorScheme = WAVEFORM_COLOR_SCHEMES[0];
let active = true;
let phase = 0;

// ── Elements ──────────────────────────────────────────────────────────────────
const canvas = document.getElementById("overlay-wave-canvas") as HTMLCanvasElement | null;
const dotEl = document.getElementById("overlay-dot");
const labelEl = document.getElementById("overlay-label");
const timerEl = document.getElementById("overlay-timer");
const transcriptEl = document.getElementById("overlay-transcript");
const hudStyleEl = document.getElementById("overlay-hud-style");
const hudSchemeEl = document.getElementById("overlay-hud-scheme");

// ── Timer ─────────────────────────────────────────────────────────────────────
let seconds = 0;
setInterval(() => {
  seconds += 1;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (timerEl) timerEl.textContent = `${m}:${String(s).padStart(2, "0")}`;
}, 1000);

// ── Tauri event listeners ─────────────────────────────────────────────────────
async function setupTauriListeners() {
  try {
    const { listen } = await import("@tauri-apps/api/event");

    await listen<string>("overlay:state", ({ payload }) => {
      if (!dotEl || !labelEl) return;
      const stateMap: Record<string, { cls: string; text: string }> = {
        loading: { cls: "loading", text: "Loading…" },
        listening: { cls: "listening", text: "Listening…" },
        transcribing: { cls: "transcribing", text: "Transcribing…" },
        correcting: { cls: "correcting", text: "Correcting…" },
        done: { cls: "done", text: "Done" },
      };
      const entry = stateMap[payload];
      if (!entry) return;
      dotEl.className = `recording-dot ${entry.cls}`;
      labelEl.textContent = entry.text;
      active = payload !== "done";
    });

    await listen<string>("overlay:transcript", ({ payload }) => {
      if (!transcriptEl) return;
      transcriptEl.textContent = payload;
      transcriptEl.classList.toggle("visible", payload.length > 0);
    });

    await listen<string>("overlay:wave-style", ({ payload }) => {
      if (payload in WAVEFORM_STYLES) {
        currentStyle = payload as WaveformStyle;
        if (hudStyleEl) hudStyleEl.textContent = getWaveformStyleLabel(currentStyle);
      }
    });

    await listen<string>("overlay:wave-scheme", ({ payload }) => {
      if (payload in WAVEFORM_COLOR_SCHEMES) {
        currentScheme = payload as WaveformColorScheme;
        if (hudSchemeEl) hudSchemeEl.textContent = getWaveformColorSchemeLabel(currentScheme);
      }
    });

    // Canvas click cycles style
    canvas?.addEventListener("click", () => {
      currentStyle = cycleWaveformStyle(currentStyle);
      if (hudStyleEl) hudStyleEl.textContent = getWaveformStyleLabel(currentStyle);
    });

  } catch {
    // Running outside Tauri — just animate with defaults
    canvas?.addEventListener("click", () => {
      currentStyle = cycleWaveformStyle(currentStyle);
      currentScheme = cycleWaveformColorScheme(currentScheme);
      if (hudStyleEl) hudStyleEl.textContent = getWaveformStyleLabel(currentStyle);
      if (hudSchemeEl) hudSchemeEl.textContent = getWaveformColorSchemeLabel(currentScheme);
    });
  }
}

setupTauriListeners();

// ── Animation loop ────────────────────────────────────────────────────────────
function tick() {
  phase += 0.08;

  if (canvas) {
    const parent = canvas.parentElement;
    if (parent) {
      const w = parent.clientWidth;
      const h = 28;
      if (canvas.width !== w) {
        canvas.width = w;
        canvas.height = h;
      }
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, w, h);
        drawWaveform(currentStyle, {
          ctx,
          width: w,
          height: h,
          amplitude: h * 0.38,
          phase,
          active,
          colorScheme: currentScheme,
        });
      }
    }
  }

  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
