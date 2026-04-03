// ── Styles (extracted to dist/style.css by the lib build) ────────────────────
// Consumers: import "@goblin-systems/goblin-design-system/style.css"
import "./tokens.css";
import "./base.css";
import "./components.css";

// ── Icons ─────────────────────────────────────────────────────────────────────
export { applyIcons, createIcon, ICON_SET } from "./icons/index";
export type { IconNode } from "./icons/index";

// ── Headless utilities ────────────────────────────────────────────────────────
export { byId, byIdOptional, qs, qsAll, populateSelectOptions, setGroupDisabled } from "./headless/dom";
export { bindNavigation } from "./headless/navigation";
export type { NavigationOptions, NavigationHandle } from "./headless/navigation";
export { mountToast, showToast } from "./headless/toast";
export type { ToastOptions, ToastVariant } from "./headless/toast";
export { bindSearch } from "./headless/search";
export type { SearchOptions, SearchHandle } from "./headless/search";
export { bindRange } from "./headless/range";
export type { RangeOptions, RangeHandle } from "./headless/range";
export { bindRadial } from "./headless/radial";
export type { RadialOptions, RadialHandle } from "./headless/radial";
export { openModal, closeModal, bindModal, confirmModal } from "./headless/modal";
export type { ModalOptions, ConfirmOptions } from "./headless/modal";
export { bindTabs } from "./headless/tabs";
export type { TabsOptions } from "./headless/tabs";
export { bindSplitPaneResize } from "./headless/split-pane";
export type { SplitPaneOptions } from "./headless/split-pane";

// ── Platform adapters ─────────────────────────────────────────────────────────
export { setupWindowControls, setupContextMenuGuard } from "./platform/tauri-window";
export type { WindowControlOptions } from "./platform/tauri-window";

// ── Waveform ──────────────────────────────────────────────────────────────────
export {
  WAVEFORM_STYLES,
  WAVEFORM_COLOR_SCHEMES,
  isWaveformStyle,
  isWaveformColorScheme,
  cycleWaveformStyle,
  cycleWaveformColorScheme,
  getWaveformStyleLabel,
  getWaveformColorSchemeLabel,
  drawWaveform,
  createWaveProgressGradient,
} from "./waveform/waveform";
export type { WaveformStyle, WaveformColorScheme, DrawWaveformOptions } from "./waveform/waveform";
