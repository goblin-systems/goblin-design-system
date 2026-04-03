export type ToastVariant = "success" | "error" | "info";

export interface ToastOptions {
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

let activeTimer: ReturnType<typeof setTimeout> | null = null;

export function mountToast(container: HTMLElement, options: ToastOptions) {
  const { message, variant = "success", durationMs = 3000, action } = options;

  if (activeTimer) {
    clearTimeout(activeTimer);
    activeTimer = null;
  }

  container.replaceChildren();
  const messageEl = document.createElement("span");
  messageEl.className = "toast-message";
  messageEl.textContent = message;
  container.appendChild(messageEl);

  if (action) {
    const actionBtn = document.createElement("button");
    actionBtn.type = "button";
    actionBtn.className = "toast-action";
    actionBtn.textContent = action.label;
    actionBtn.addEventListener("click", () => {
      action.onClick();
      container.classList.remove("visible");
    }, { once: true });
    container.appendChild(actionBtn);
  }

  container.className = `app-toast ${variant}`;
  container.setAttribute("role", variant === "error" ? "alert" : "status");
  container.setAttribute("aria-live", variant === "error" ? "assertive" : "polite");

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
  toastId = "app-toast",
  action?: ToastOptions["action"]
) {
  const el = document.getElementById(toastId);
  if (!el) return;
  mountToast(el, { message, variant, durationMs, action });
}
