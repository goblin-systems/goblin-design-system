export type ToastVariant = "success" | "error" | "info";

export interface ToastOptions {
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
}

let activeTimer: ReturnType<typeof setTimeout> | null = null;

export function mountToast(container: HTMLElement, options: ToastOptions) {
  const { message, variant = "success", durationMs = 3000 } = options;

  if (activeTimer) {
    clearTimeout(activeTimer);
    activeTimer = null;
  }

  container.textContent = message;
  container.className = `app-toast ${variant}`;

  // Force reflow so transition triggers even when re-showing
  void container.offsetHeight;
  container.classList.add("visible");

  activeTimer = setTimeout(() => {
    container.classList.remove("visible");
    activeTimer = null;
  }, durationMs);
}

/** Convenience: resolve toast element by id and show it. */
export function showToast(
  message: string,
  variant: ToastVariant = "success",
  durationMs = 3000,
  toastId = "app-toast"
) {
  const el = document.getElementById(toastId);
  if (!el) return;
  mountToast(el, { message, variant, durationMs });
}
