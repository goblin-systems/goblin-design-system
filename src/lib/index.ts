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
export { BUILTIN_THEMES, THEME_LABELS, applyTheme, getTheme, isBuiltinTheme, isUiTheme, setTheme } from "./theme";
export type { ApplyThemeOptions, BuiltinTheme, UiTheme } from "./theme";
export { bindNavigation } from "./headless/navigation";
export type { NavigationOptions, NavigationHandle } from "./headless/navigation";
export { mountToast, showToast } from "./headless/toast";
export type { ToastOptions, ToastVariant } from "./headless/toast";
export { bindSearch } from "./headless/search";
export type { SearchOptions, SearchHandle } from "./headless/search";
export { bindTooltips } from "./headless/tooltip";
export type { TooltipOptions, TooltipHandle } from "./headless/tooltip";
export { bindRange } from "./headless/range";
export type { RangeOptions, RangeHandle } from "./headless/range";
export { bindRadial } from "./headless/radial";
export type { RadialOptions, RadialHandle } from "./headless/radial";
export { openModal, closeModal, bindModal, confirmModal } from "./headless/modal";
export type { ModalOptions, ConfirmOptions } from "./headless/modal";
export { bindTabs } from "./headless/tabs";
export type { TabsOptions } from "./headless/tabs";
export { bindSwitch } from "./headless/switch";
export type { SwitchOptions, SwitchHandle } from "./headless/switch";
export { bindAccordion } from "./headless/accordion";
export type { AccordionOptions, AccordionHandle } from "./headless/accordion";
export { openDrawer, closeDrawer } from "./headless/drawer";
export type { DrawerOptions } from "./headless/drawer";
export { bindPagination } from "./headless/pagination";
export type { PaginationOptions, PaginationHandle } from "./headless/pagination";
export { bindPopover } from "./headless/popover";
export type { PopoverOptions, PopoverHandle, PopoverPlacement, PopoverTrigger } from "./headless/popover";
export { bindSplitPaneResize } from "./headless/split-pane";
export type { SplitPaneOptions } from "./headless/split-pane";
export { bindStepper } from "./headless/stepper";
export type { StepperOptions, StepperHandle, StepState } from "./headless/stepper";
export { bindToggleGroup } from "./headless/toggle-group";
export type { ToggleGroupOptions, ToggleGroupHandle } from "./headless/toggle-group";
export { bindTable } from "./headless/table";
export type { TableOptions, TableHandle, TableSortDirection } from "./headless/table";
export { bindSelect } from "./headless/select";
export type { SelectOptions, SelectHandle, SelectOption } from "./headless/select";
export { bindTransferList } from "./headless/transfer-list";
export type { TransferListOptions, TransferListHandle } from "./headless/transfer-list";
export { bindRating } from "./headless/rating";
export type { RatingOptions, RatingHandle } from "./headless/rating";
export { bindTree } from "./headless/tree";
export type { TreeOptions, TreeHandle } from "./headless/tree";
export { bindContextMenu } from "./headless/context-menu";
export type { ContextMenuOptions, ContextMenuHandle, ContextMenuItem } from "./headless/context-menu";

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
