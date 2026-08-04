export interface ClickOutsideOptions {
  /**
   * Which pointer event to listen for.
   * `"pointerdown"` (default) fires before `click` and works for touch too.
   */
  event?: "pointerdown" | "mousedown" | "click";
}

/**
 * Calls `callback` whenever the user clicks/taps outside `el`.
 * Returns a stop function that removes the listener.
 *
 * ```ts
 * const stop = bindClickOutside(menuEl, () => closeMenu());
 * // later:
 * stop();
 * ```
 */
export function bindClickOutside(
  el: HTMLElement,
  callback: () => void,
  options: ClickOutsideOptions = {},
): () => void {
  const { event = "pointerdown" } = options;

  function handler(e: Event) {
    if (!el.contains(e.target as Node)) {
      callback();
    }
  }

  // Use capture so it fires before any stopPropagation inside the element.
  document.addEventListener(event, handler, true);
  return () => document.removeEventListener(event, handler, true);
}
