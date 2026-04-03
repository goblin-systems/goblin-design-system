import { applyIcons, ICON_SET } from "./lib/icons/index";
import { setupWindowControls, setupContextMenuGuard } from "./lib/platform/tauri-window";
import { bindTabs } from "./lib/headless/tabs";
import { showToast } from "./lib/headless/toast";
import { openModal, closeModal, confirmModal } from "./lib/headless/modal";
import { bindSearch } from "./lib/headless/search";
import { bindTooltips } from "./lib/headless/tooltip";
import { bindRange } from "./lib/headless/range";
import { bindRadial } from "./lib/headless/radial";
import { bindNavigation } from "./lib/headless/navigation";
import { bindSwitch } from "./lib/headless/switch";
import { bindToggleGroup } from "./lib/headless/toggle-group";
import { bindAccordion } from "./lib/headless/accordion";
import { openDrawer, closeDrawer } from "./lib/headless/drawer";
import { bindPagination } from "./lib/headless/pagination";
import { bindPopover } from "./lib/headless/popover";
import { bindStepper } from "./lib/headless/stepper";
import { bindTable } from "./lib/headless/table";
import { bindSelect } from "./lib/headless/select";
import { bindTransferList } from "./lib/headless/transfer-list";
import { bindRating } from "./lib/headless/rating";
import { bindTree } from "./lib/headless/tree";
import { bindContextMenu } from "./lib/headless/context-menu";
import { bindSplitPaneResize } from "./lib/headless/split-pane";
import { THEME_LABELS, getTheme, isBuiltinTheme, setTheme } from "./lib/theme";
import {
  WAVEFORM_STYLES,
  WAVEFORM_COLOR_SCHEMES,
  cycleWaveformStyle,
  cycleWaveformColorScheme,
  getWaveformStyleLabel,
  getWaveformColorSchemeLabel,
  drawWaveform,
  type WaveformStyle,
  type WaveformColorScheme,
} from "./lib/waveform/waveform";

// ── Shared waveform state ─────────────────────────────────────────────────────
document.documentElement.dataset.js = "true";

let currentStyle: WaveformStyle = "classic";
let currentScheme: WaveformColorScheme = "aurora";
let waveActive = true;
let wavePhase = 0;

// ── Window setup ──────────────────────────────────────────────────────────────
setupWindowControls();
setupContextMenuGuard();

// ── Icons ─────────────────────────────────────────────────────────────────────
// Run after buildWaveformPanels so dynamic content is also covered
// (called again below after panel build)

// ── Top-level tabs ────────────────────────────────────────────────────────────
bindTabs({
  root: document,
  triggerSelector: ".top-tabs [data-tab-trigger]",
  panelSelector: ".app-shell > .tab-panel",
});

// ── Built-in theme demo ───────────────────────────────────────────────────────
const themeSelect = document.getElementById("theme-select") as HTMLSelectElement | null;
const themeCurrentBadge = document.getElementById("theme-current-badge");
const themeCurrentId = document.getElementById("theme-current-id");

function syncThemeDemo(theme = getTheme()) {
  if (themeSelect) themeSelect.value = theme;
  if (themeCurrentBadge) themeCurrentBadge.textContent = THEME_LABELS[theme];
  if (themeCurrentId) themeCurrentId.textContent = `data-theme=${theme}`;
}

syncThemeDemo();

themeSelect?.addEventListener("change", () => {
  const nextTheme = themeSelect.value;
  if (!isBuiltinTheme(nextTheme)) {
    syncThemeDemo();
    return;
  }

  syncThemeDemo(setTheme(nextTheme));
});

// ── Header navigation demo ────────────────────────────────────────────────────
const navLog = document.getElementById("nav-action-log");
bindNavigation({
  root: document.getElementById("demo-nav") ?? document,
  onSelect: (id) => {
    if (navLog) navLog.textContent = `Selected: ${id}`;
  },
});

// ── Toast demos ───────────────────────────────────────────────────────────────
document.getElementById("toast-success-btn")?.addEventListener("click", () => {
  showToast("Action completed successfully.", "success");
});
document.getElementById("toast-error-btn")?.addEventListener("click", () => {
  showToast("Something went wrong. Please try again.", "error");
});
document.getElementById("toast-info-btn")?.addEventListener("click", () => {
  showToast("Here is some helpful information.", "info");
});

// ── Modal demo ────────────────────────────────────────────────────────────────
const modalBackdrop = document.getElementById("demo-modal")!;
const modalResultLog = document.getElementById("modal-result-log");

document.getElementById("open-modal-btn")?.addEventListener("click", () => {
  openModal({
    backdrop: modalBackdrop,
    onAccept: () => {
      if (modalResultLog) modalResultLog.textContent = "Result: accepted";
      showToast("Modal accepted", "success");
    },
    onReject: () => {
      if (modalResultLog) modalResultLog.textContent = "Result: rejected";
      showToast("Modal rejected", "info");
    },
  });
});

document.getElementById("confirm-modal-btn")?.addEventListener("click", async () => {
  const ok = await confirmModal({
    title: "Confirm action",
    message: "Are you sure you want to proceed? This cannot be undone.",
    acceptLabel: "Yes, proceed",
  });
  if (modalResultLog) modalResultLog.textContent = `Confirm result: ${ok ? "accepted" : "rejected"}`;
  showToast(ok ? "Confirmed" : "Cancelled", ok ? "success" : "info");
});

document.getElementById("confirm-danger-btn")?.addEventListener("click", async () => {
  const ok = await confirmModal({
    title: "Delete item?",
    message: "This will permanently delete the item. This action cannot be undone.",
    acceptLabel: "Delete",
    variant: "danger",
  });
  if (modalResultLog) modalResultLog.textContent = `Danger confirm result: ${ok ? "deleted" : "cancelled"}`;
  showToast(ok ? "Item deleted" : "Cancelled", ok ? "error" : "info");
});

// ── Status indicator cycle ────────────────────────────────────────────────────
const statusStates = ["connected", "untested", "disconnected", "error"] as const;
let statusIdx = 0;
const statusLabels: Record<string, string> = {
  connected: "Connected",
  untested: "Untested",
  disconnected: "Disconnected",
  error: "Error",
};
document.getElementById("cycle-status-btn")?.addEventListener("click", () => {
  const indicators = document.querySelectorAll<HTMLElement>(".status-indicator");
  indicators.forEach((el) => {
    statusStates.forEach((s) => el.classList.remove(s));
  });
  statusIdx = (statusIdx + 1) % statusStates.length;
  indicators.forEach((el) => {
    el.classList.add(statusStates[statusIdx]);
    const label = el.querySelector("span:last-child");
    if (label) label.textContent = statusLabels[statusStates[statusIdx]] ?? "";
  });
});

// ── Single range fill sync ────────────────────────────────────────────────────
function syncRangeFill(input: HTMLInputElement) {
  const pct = ((+input.value - +input.min) / (+input.max - +input.min)) * 100;
  input.style.setProperty("--_pct", `${pct}%`);
}
const singleRange = document.getElementById("demo-single-range") as HTMLInputElement | null;
if (singleRange) {
  syncRangeFill(singleRange);
  singleRange.addEventListener("input", () => syncRangeFill(singleRange));
}

// ── Range slider demos ────────────────────────────────────────────────────────
const rangeLog = document.getElementById("range-log");

const rangeEl = document.getElementById("demo-range");
if (rangeEl) {
  bindRange({
    el: rangeEl,
    min: 0,
    max: 1000,
    step: 10,
    value: [200, 750],
    onChange: (lo, hi) => {
      if (rangeLog) rangeLog.textContent = `Price: $${lo} – $${hi}`;
    },
  });
}

const rangeEl2 = document.getElementById("demo-range-2");
if (rangeEl2) {
  bindRange({
    el: rangeEl2,
    min: 1900,
    max: 2030,
    step: 5,
    value: [1980, 2010],
    onChange: (lo, hi) => {
      if (rangeLog) rangeLog.textContent = `Years: ${lo} – ${hi}`;
    },
  });
}

const rangeElInv = document.getElementById("demo-range-inv");
if (rangeElInv) {
  bindRange({
    el: rangeElInv,
    min: 0,
    max: 100,
    step: 10,
    value: [20, 80],
    inverted: true,
    onChange: (lo, hi) => {
      if (rangeLog) rangeLog.textContent = `Exclusion: < ${lo} and > ${hi}`;
    },
  });
}

const radialLog = document.getElementById("radial-log");

const radialEl = document.getElementById("demo-radial");
if (radialEl) {
  bindRadial({
    el: radialEl,
    min: 0,
    max: 360,
    step: 5,
    value: 135,
    formatValue: (value) => `${value}\u00b0`,
    onChange: (value) => {
      if (radialLog) radialLog.textContent = `Heading: ${value}\u00b0`;
    },
  });
}

const radialSweepEl = document.getElementById("demo-radial-sweep");
if (radialSweepEl) {
  bindRadial({
    el: radialSweepEl,
    min: 20,
    max: 160,
    step: 5,
    value: 65,
    startAngle: 210,
    endAngle: 330,
    formatValue: (value) => `${value}\u00b0`,
    onChange: (value) => {
      if (radialLog) radialLog.textContent = `Cone: ${value}\u00b0 within 20\u00b0-160\u00b0`;
    },
  });
}

const radialFineEl = document.getElementById("demo-radial-fine");
if (radialFineEl) {
  bindRadial({
    el: radialFineEl,
    min: -12,
    max: 12,
    step: 1,
    value: 3,
    startAngle: 235,
    endAngle: 485,
    formatValue: (value) => `${value > 0 ? "+" : ""}${value}`,
    onChange: (value) => {
      if (radialLog) radialLog.textContent = `Trim: ${value > 0 ? "+" : ""}${value}`;
    },
  });
}

// ── Split pane ────────────────────────────────────────────────────────────────
const workspace = document.getElementById("split-workspace") as HTMLElement | null;
const leftResizer = document.getElementById("left-pane-resizer") as HTMLElement | null;
const rightResizer = document.getElementById("right-pane-resizer") as HTMLElement | null;

if (workspace && leftResizer && rightResizer) {
  bindSplitPaneResize({ workspace, leftResizer, rightResizer });
}

document.getElementById("collapse-left-btn")?.addEventListener("click", () => {
  workspace?.classList.toggle("left-collapsed");
});
document.getElementById("collapse-right-btn")?.addEventListener("click", () => {
  workspace?.classList.toggle("right-collapsed");
});

// ── Waveform section ──────────────────────────────────────────────────────────

// Build multi-style preview panels
function buildWaveformPanels() {
  const container = document.getElementById("waveform-panels");
  if (!container) return;
  container.innerHTML = "";

  for (const style of WAVEFORM_STYLES) {
    const section = document.createElement("div");
    section.className = "settings-section";

    const heading = document.createElement("div");
    heading.className = "section-heading-row";
    heading.innerHTML = `
      <h2>${getWaveformStyleLabel(style)}</h2>
      <span class="badge default">${style}</span>
    `;

    const wrap = document.createElement("div");
    wrap.className = "wave-panel";

    const canvasWrap = document.createElement("div");
    canvasWrap.className = "wave-canvas-wrap";
    canvasWrap.style.height = "80px";

    const canvas = document.createElement("canvas");
    canvas.dataset["waveStyle"] = style;
    canvas.height = 80;
    canvasWrap.appendChild(canvas);
    wrap.appendChild(canvasWrap);
    section.appendChild(heading);
    section.appendChild(wrap);
    container.appendChild(section);
  }
}

buildWaveformPanels();
applyIcons();
buildIconGallery();
bindTooltips();

// Main single preview
const mainCanvas = document.getElementById("main-wave-canvas") as HTMLCanvasElement | null;
const mainStyleLabel = document.getElementById("main-wave-style-label");
const mainSchemeLabel = document.getElementById("main-wave-scheme-label");

function updateMainWaveLabels() {
  if (mainStyleLabel) mainStyleLabel.textContent = getWaveformStyleLabel(currentStyle);
  if (mainSchemeLabel) mainSchemeLabel.textContent = getWaveformColorSchemeLabel(currentScheme);
}

document.getElementById("wave-style-btn")?.addEventListener("click", () => {
  currentStyle = cycleWaveformStyle(currentStyle);
  const btn = document.getElementById("wave-style-btn");
  if (btn) btn.textContent = `Style: ${getWaveformStyleLabel(currentStyle)} →`;
  updateMainWaveLabels();
});

document.getElementById("wave-scheme-btn")?.addEventListener("click", () => {
  currentScheme = cycleWaveformColorScheme(currentScheme);
  const btn = document.getElementById("wave-scheme-btn");
  if (btn) btn.textContent = `Scheme: ${getWaveformColorSchemeLabel(currentScheme)} →`;
  updateMainWaveLabels();
});

document.getElementById("wave-active-btn")?.addEventListener("click", (e) => {
  waveActive = !waveActive;
  (e.target as HTMLButtonElement).textContent = `Active: ${waveActive ? "ON" : "OFF"}`;
});

// ── Overlay demo waveform ─────────────────────────────────────────────────────
const overlayDemoCanvas = document.getElementById("overlay-demo-canvas") as HTMLCanvasElement | null;
let overlayDemoStyle: WaveformStyle = "classic";
let overlayDemoScheme: WaveformColorScheme = "aurora";
let overlayDemoActive = true;

// Overlay state buttons
function setOverlayState(state: string) {
  const dot = document.getElementById("demo-dot");
  const label = document.getElementById("demo-label");
  if (!dot || !label) return;

  const stateMap: Record<string, { cls: string; text: string }> = {
    loading: { cls: "loading", text: "Loading…" },
    listening: { cls: "listening", text: "Listening…" },
    transcribing: { cls: "transcribing", text: "Transcribing…" },
    correcting: { cls: "correcting", text: "Correcting…" },
    done: { cls: "done", text: "Done" },
  };

  const entry = stateMap[state];
  if (!entry) return;

  dot.className = `recording-dot ${entry.cls}`;
  label.textContent = entry.text;
}

["loading", "listening", "transcribing", "correcting", "done"].forEach((state) => {
  document.getElementById(`overlay-state-${state}`)?.addEventListener("click", () => {
    setOverlayState(state);
  });
});

document.getElementById("overlay-toggle-transcript")?.addEventListener("click", () => {
  document.getElementById("demo-transcript")?.classList.toggle("visible");
});

document.getElementById("overlay-toggle-hud")?.addEventListener("click", () => {
  const hud = document.getElementById("demo-hud");
  if (hud) hud.hidden = !hud.hidden;
});

document.getElementById("overlay-cycle-wave-style")?.addEventListener("click", () => {
  overlayDemoStyle = cycleWaveformStyle(overlayDemoStyle);
  const hud = document.getElementById("demo-hud");
  if (hud) {
    const spans = hud.querySelectorAll("span");
    if (spans[0]) spans[0].textContent = getWaveformStyleLabel(overlayDemoStyle);
  }
});

document.getElementById("overlay-cycle-wave-scheme")?.addEventListener("click", () => {
  overlayDemoScheme = cycleWaveformColorScheme(overlayDemoScheme);
  const hud = document.getElementById("demo-hud");
  if (hud) {
    const spans = hud.querySelectorAll("span");
    if (spans[2]) spans[2].textContent = getWaveformColorSchemeLabel(overlayDemoScheme);
  }
});

// ── Overlay window controls ───────────────────────────────────────────────────
async function setOverlayVisible(visible: boolean) {
  try {
    const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");
    const overlayWin = await WebviewWindow.getByLabel("overlay");
    if (overlayWin) {
      if (visible) {
        await overlayWin.show();
      } else {
        await overlayWin.hide();
      }
    }
  } catch {
    showToast(visible ? "Overlay shown" : "Overlay hidden", "info");
  }
}

document.getElementById("overlay-show-btn")?.addEventListener("click", () => setOverlayVisible(true));
document.getElementById("overlay-hide-btn")?.addEventListener("click", () => setOverlayVisible(false));

function logDemoEvent(message: string) {
  const consoleEl = document.getElementById("demo-console");
  if (!consoleEl) return;
  const line = document.createElement("div");
  line.textContent = `${new Date().toLocaleTimeString()} · ${message}`;
  consoleEl.prepend(line);
}

document.querySelectorAll<HTMLElement>("#demo-alerts .alert-dismiss").forEach((button) => {
  button.addEventListener("click", () => {
    button.closest(".alert")?.remove();
    logDemoEvent("Inline alert dismissed");
  });
});

document.querySelectorAll<HTMLElement>(".copy-markup-btn").forEach((button) => {
  button.addEventListener("click", async () => {
    const markup = button.dataset["copyMarkup"] ?? "";
    try {
      await navigator.clipboard.writeText(markup);
      showToast("Markup copied", "success", 1800);
      logDemoEvent("Copied markup snippet");
    } catch {
      showToast("Copy failed", "error", 2200);
    }
  });
});

bindSwitch({
  el: document.getElementById("switch-auto-correct") as HTMLElement,
  onChange: (checked) => logDemoEvent(`Switch auto-correct: ${checked}`),
});
bindSwitch({
  el: document.getElementById("switch-snap-grid") as HTMLElement,
  onChange: (checked) => logDemoEvent(`Switch snap to grid: ${checked}`),
});
bindSwitch({ el: document.getElementById("switch-disabled") as HTMLElement });
bindSwitch({
  el: document.getElementById("keyboard-only-mode") as HTMLElement,
  onChange: (checked) => {
    document.body.style.cursor = checked ? "none" : "";
    logDemoEvent(`Keyboard-only mode: ${checked ? "on" : "off"}`);
  },
});

bindToggleGroup({
  el: document.getElementById("demo-toggle-group") as HTMLElement,
  multiple: true,
  onChange: (selected) => logDemoEvent(`Toggle group: ${selected.join(", ") || "none"}`),
});

bindTable({
  el: document.getElementById("demo-table") as HTMLTableElement,
  onSort: (column, direction) => logDemoEvent(`Table sort col ${column + 1}: ${direction ?? "none"}`),
});

bindSelect({
  el: document.getElementById("demo-select") as HTMLElement,
  onChange: (value) => {
    logDemoEvent(`Select changed: ${value}`);
    applyIcons();
  },
});
applyIcons();

bindRating({
  el: document.getElementById("demo-rating") as HTMLElement,
  onChange: (value) => logDemoEvent(`Rating: ${value}/5`),
});

bindTransferList({ el: document.getElementById("demo-transfer-list") as HTMLElement });
bindTree({ el: document.getElementById("demo-tree") as HTMLElement });

document.querySelectorAll<HTMLElement>("#demo-chip-row .chip-remove").forEach((button) => {
  button.addEventListener("click", () => {
    button.closest(".chip")?.remove();
    logDemoEvent("Chip removed");
  });
});
document.querySelectorAll<HTMLElement>("#demo-chip-row .chip").forEach((chip) => {
  chip.addEventListener("keydown", (event) => {
    if (event.key === "Backspace") {
      chip.querySelector<HTMLElement>(".chip-remove")?.click();
    }
  });
});

bindStepper({
  el: document.getElementById("demo-stepper") as HTMLElement,
  onChange: (index, state) => logDemoEvent(`Stepper: step ${index + 1} is ${state}`),
});

bindPagination({
  el: document.getElementById("demo-pagination") as HTMLElement,
  totalPages: 12,
  currentPage: 6,
  onChange: (page) => logDemoEvent(`Pagination page ${page}`),
});

bindAccordion({ el: document.getElementById("demo-accordion-single") as HTMLElement });
bindAccordion({ el: document.getElementById("demo-accordion-multi") as HTMLElement, multiple: true });

const leftDrawer = document.getElementById("demo-left-drawer") as HTMLElement | null;
const rightDrawer = document.getElementById("demo-right-drawer") as HTMLElement | null;

document.getElementById("demo-left-drawer-btn")?.addEventListener("click", () => {
  if (!leftDrawer) return;
  openDrawer({ drawer: leftDrawer, onOpen: () => logDemoEvent("Opened left drawer"), onClose: () => logDemoEvent("Closed left drawer") });
});

document.getElementById("demo-right-drawer-btn")?.addEventListener("click", () => {
  if (!rightDrawer) return;
  openDrawer({ drawer: rightDrawer, onOpen: () => logDemoEvent("Opened right drawer"), onClose: () => logDemoEvent("Closed right drawer") });
});

document.querySelectorAll<HTMLElement>("[data-drawer-close='left']").forEach((button) => {
  button.addEventListener("click", () => leftDrawer && closeDrawer({ drawer: leftDrawer }));
});
document.querySelectorAll<HTMLElement>("[data-drawer-close='right']").forEach((button) => {
  button.addEventListener("click", () => rightDrawer && closeDrawer({ drawer: rightDrawer }));
});

bindPopover({
  anchor: document.getElementById("demo-popover-btn") as HTMLElement,
  content: document.getElementById("demo-click-popover") as HTMLElement,
  placement: "bottom",
  onOpen: () => {
    applyIcons();
    logDemoEvent("Opened click popover");
  },
});
bindPopover({
  anchor: document.getElementById("demo-hover-popover-btn") as HTMLElement,
  content: document.getElementById("demo-hover-popover") as HTMLElement,
  placement: "right",
  trigger: "hover",
});

bindContextMenu({
  target: "#demo-rich-list",
  items: [
    { label: "Open", icon: "folder-open", shortcut: "Enter", onSelect: () => logDemoEvent("Context: open") },
    { label: "Rename", icon: "pencil", shortcut: "F2", onSelect: () => logDemoEvent("Context: rename") },
    { divider: true },
    { label: "Retry", icon: "rotate-cw", shortcut: "R", onSelect: () => logDemoEvent("Context: retry") },
    { label: "Delete", icon: "trash-2", disabled: true },
  ],
});

document.getElementById("toast-action-btn")?.addEventListener("click", () => {
  showToast("Draft archived.", "info", 5000, "app-toast", {
    label: "Undo",
    onClick: () => {
      logDemoEvent("Toast action: undo");
      showToast("Archive reverted.", "success", 1800);
    },
  });
});

document.getElementById("toast-error-assertive-btn")?.addEventListener("click", () => {
  showToast("Critical sync failed.", "error", 2600);
  logDemoEvent("Assertive error toast shown");
});

[
  { id: "token-accent", variable: "--accent", format: (value: string) => value },
  { id: "token-bg", variable: "--bg", format: (value: string) => value },
  { id: "token-border", variable: "--border", format: (value: string) => value },
  { id: "token-text", variable: "--text", format: (value: string) => value },
  { id: "token-font-size", variable: "--font-size-base", format: (value: string) => `${value}px` },
].forEach(({ id, variable, format }) => {
  const input = document.getElementById(id) as HTMLInputElement | null;
  input?.addEventListener("input", () => {
    document.documentElement.style.setProperty(variable, format(input.value));
    logDemoEvent(`Token override ${variable}`);
  });
});

// ── Icon gallery ──────────────────────────────────────────────────────────────
function buildIconGallery() {
  const container = document.getElementById("icon-gallery");
  const searchInput = document.getElementById("icon-search") as HTMLInputElement | null;
  const countEl = document.getElementById("icon-count");
  if (!container) return;

  const toKebab = (s: string) =>
    s.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

  const allNames = Object.keys(ICON_SET).map(toKebab).sort();

  function renderGallery(query: string) {
    const q = query.trim().toLowerCase();
    const matches = q ? allNames.filter((n) => n.includes(q)) : allNames;

    container!.innerHTML = "";
    const frag = document.createDocumentFragment();
    for (const kebab of matches) {
      const cell = document.createElement("button");
      cell.className = "icon-gallery-cell";
      cell.title = kebab;
      cell.innerHTML = `<i data-lucide="${kebab}"></i><span>${kebab}</span>`;
      cell.addEventListener("click", () => {
        navigator.clipboard.writeText(kebab).catch(() => {});
        showToast(`Copied: ${kebab}`, "success", 1800);
      });
      frag.appendChild(cell);
    }
    container!.appendChild(frag);

    if (countEl) countEl.textContent = `${matches.length} of ${allNames.length}`;
    applyIcons();
  }

  renderGallery("");

  if (searchInput) {
    bindSearch({
      input: searchInput,
      debounce: 120,
      onSearch: (q) => renderGallery(q),
    });
  }
}

// ── Animation loop ────────────────────────────────────────────────────────────
function tick() {
  wavePhase += 0.08;

  // Multi-panel waveforms (one per style)
  const stylePanels = document.querySelectorAll<HTMLCanvasElement>("[data-wave-style]");
  stylePanels.forEach((canvas) => {
    const style = canvas.dataset["waveStyle"] as WaveformStyle;
    const parent = canvas.parentElement;
    if (!parent) return;

    const w = parent.clientWidth;
    const h = parent.clientHeight || 80;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    drawWaveform(style, {
      ctx,
      width: w,
      height: h,
      amplitude: h * 0.32,
      phase: wavePhase,
      active: waveActive,
      colorScheme: currentScheme,
    });
  });

  // Main single preview canvas
  if (mainCanvas) {
    const parent = mainCanvas.parentElement;
    if (parent) {
      const w = parent.clientWidth;
      const h = 100;
      if (mainCanvas.width !== w) {
        mainCanvas.width = w;
        mainCanvas.height = h;
      }
      const ctx = mainCanvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, w, h);
        drawWaveform(currentStyle, {
          ctx,
          width: w,
          height: h,
          amplitude: h * 0.38,
          phase: wavePhase,
          active: waveActive,
          colorScheme: currentScheme,
        });
      }
    }
  }

  // Overlay demo canvas
  if (overlayDemoCanvas) {
    const parent = overlayDemoCanvas.parentElement;
    if (parent) {
      const w = parent.clientWidth;
      const h = 28;
      if (overlayDemoCanvas.width !== w) {
        overlayDemoCanvas.width = w;
        overlayDemoCanvas.height = h;
      }
      const ctx = overlayDemoCanvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, w, h);
        drawWaveform(overlayDemoStyle, {
          ctx,
          width: w,
          height: h,
          amplitude: h * 0.38,
          phase: wavePhase,
          active: overlayDemoActive,
          colorScheme: overlayDemoScheme,
        });
      }
    }
  }

  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
