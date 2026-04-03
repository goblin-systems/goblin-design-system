export const BUILTIN_THEMES = ["goblin", "dark", "light"] as const;

export type BuiltinTheme = (typeof BUILTIN_THEMES)[number];
export type UiTheme = BuiltinTheme;

export const THEME_LABELS: Record<BuiltinTheme, string> = {
  goblin: "Goblin",
  dark: "Dark",
  light: "Light",
};

export interface ApplyThemeOptions {
  target?: HTMLElement;
}

export function isBuiltinTheme(value: unknown): value is BuiltinTheme {
  return value === "goblin" || value === "dark" || value === "light";
}

export const isUiTheme = isBuiltinTheme;

export function getTheme(target: HTMLElement = document.documentElement): BuiltinTheme {
  const theme = target.getAttribute("data-theme");
  return isBuiltinTheme(theme) ? theme : "goblin";
}

export function setTheme(theme: BuiltinTheme, options: ApplyThemeOptions = {}): BuiltinTheme {
  const target = options.target ?? document.documentElement;
  target.setAttribute("data-theme", theme);
  return theme;
}

export const applyTheme = setTheme;
