const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

/**
 * Trap keyboard focus inside `container`. Returns a cleanup function that
 * releases the trap when called.
 */
export function trapFocus(container: HTMLElement): () => void {
  const getFocusable = () =>
    Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (el) => !el.closest("[hidden]") && el.offsetParent !== null
    );

  const handler = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const items = getFocusable();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };

  document.addEventListener("keydown", handler);
  return () => document.removeEventListener("keydown", handler);
}

export { FOCUSABLE_SELECTOR as FOCUSABLE };
