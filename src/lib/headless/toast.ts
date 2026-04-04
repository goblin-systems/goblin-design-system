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

export interface ToastQueueHandle {
  push(options: ToastOptions): () => void;
  clear(): void;
}

export function createToastQueue(containerId = "app-toast-region"): ToastQueueHandle {
  let region = document.getElementById(containerId);
  if (!region) {
    region = document.createElement("div");
    region.id = containerId;
    region.className = "toast-region";
    document.body.appendChild(region);
  }
  const regionEl = region;

  return {
    push(options: ToastOptions): () => void {
      const { message, variant = "success", durationMs = 3000, action } = options;

      const toast = document.createElement("div");
      toast.className = `app-toast ${variant}`;
      toast.setAttribute("role", variant === "error" ? "alert" : "status");
      toast.setAttribute("aria-live", variant === "error" ? "assertive" : "polite");

      const messageEl = document.createElement("span");
      messageEl.className = "toast-message";
      messageEl.textContent = message;
      toast.appendChild(messageEl);

      if (action) {
        const actionBtn = document.createElement("button");
        actionBtn.type = "button";
        actionBtn.className = "toast-action";
        actionBtn.textContent = action.label;
        actionBtn.addEventListener("click", () => { action.onClick(); dismiss(); }, { once: true });
        toast.appendChild(actionBtn);
      }

      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "toast-close";
      closeBtn.setAttribute("aria-label", "Dismiss");
      closeBtn.textContent = "×";
      closeBtn.addEventListener("click", () => dismiss(), { once: true });
      toast.appendChild(closeBtn);

      regionEl.appendChild(toast);
      void toast.offsetHeight;
      toast.classList.add("visible");

      const timer = setTimeout(dismiss, durationMs);

      function dismiss() {
        clearTimeout(timer);
        toast.classList.remove("visible");
        const onEnd = () => toast.remove();
        toast.addEventListener("transitionend", onEnd, { once: true });
        setTimeout(onEnd, 400);
      }

      return dismiss;
    },

    clear() {
      regionEl.replaceChildren();
    },
  };
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
