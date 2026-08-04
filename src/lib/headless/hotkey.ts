const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

export interface HotkeyOptions {
  /**
   * Element to attach the listener to. Defaults to `window`.
   * Useful for scoping a shortcut to a specific panel or dialog.
   */
  target?: EventTarget;
  /**
   * Prevent the browser's default action for this key combination.
   * Defaults to `true`.
   */
  preventDefault?: boolean;
}

/**
 * Registers a keyboard shortcut and returns an unbind function.
 *
 * Key syntax: modifier(s) joined by `+`, then the key name.
 * Modifiers: `ctrl`, `shift`, `alt`, `meta`, `mod`
 * `mod` resolves to `ctrl` on Windows/Linux and `meta` (Cmd) on macOS.
 *
 * Examples:
 *   "mod+k"          → Ctrl+K / Cmd+K
 *   "ctrl+shift+p"   → Ctrl+Shift+P (all platforms)
 *   "escape"         → Escape
 *   "alt+arrowup"    → Alt+↑
 */
export function bindHotkey(
  keys: string,
  callback: (e: KeyboardEvent) => void,
  options: HotkeyOptions = {},
): () => void {
  const { target = window, preventDefault = true } = options;

  const parts = keys.toLowerCase().split("+");
  const key = parts[parts.length - 1];
  const needsCtrl = parts.includes("ctrl") || (parts.includes("mod") && !isMac);
  const needsMeta = parts.includes("meta") || (parts.includes("mod") && isMac);
  const needsShift = parts.includes("shift");
  const needsAlt = parts.includes("alt");

  function handler(e: Event) {
    const ke = e as KeyboardEvent;
    if (
      ke.key.toLowerCase() === key &&
      ke.ctrlKey === needsCtrl &&
      ke.metaKey === needsMeta &&
      ke.shiftKey === needsShift &&
      ke.altKey === needsAlt
    ) {
      if (preventDefault) ke.preventDefault();
      callback(ke);
    }
  }

  target.addEventListener("keydown", handler);
  return () => target.removeEventListener("keydown", handler);
}
