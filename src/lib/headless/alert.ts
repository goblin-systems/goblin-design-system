export interface AlertOptions {
  /** The `.alert` element to bind. */
  el: HTMLElement;
  /** Called after the alert is dismissed. */
  onDismiss?: () => void;
  /** Auto-dismiss after this many milliseconds. Omit for manual-only. */
  duration?: number;
}

export interface AlertHandle {
  /** Hide the alert immediately. */
  dismiss(): void;
  /** Remove event listeners and clear any pending timer. */
  destroy(): void;
}

/**
 * Binds dismiss behaviour to an `.alert` element.
 *
 * Sets `html[data-js="true"]` on first call, which reveals the
 * `.alert-dismiss` button via CSS.
 */
export function bindAlert(options: AlertOptions): AlertHandle {
  const { el, onDismiss, duration } = options;

  // Progressive-enhancement gate: reveal dismiss buttons system-wide.
  document.documentElement.dataset.js = "true";

  const btn = el.querySelector<HTMLElement>(".alert-dismiss");
  let timer: ReturnType<typeof setTimeout> | null = null;

  function dismiss() {
    if (timer !== null) { clearTimeout(timer); timer = null; }
    el.hidden = true;
    onDismiss?.();
  }

  btn?.addEventListener("click", dismiss);

  if (duration && duration > 0) {
    timer = setTimeout(dismiss, duration);
  }

  return {
    dismiss,
    destroy() {
      btn?.removeEventListener("click", dismiss);
      if (timer !== null) { clearTimeout(timer); timer = null; }
    },
  };
}
