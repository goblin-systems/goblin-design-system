import { trapFocus } from "./focus-trap";

export interface DrawerOptions {
  /** The `.drawer` panel element. */
  drawer: HTMLElement;
  /** Optional backdrop element. If not provided one is created automatically when overlay is true. */
  backdrop?: HTMLElement;
  /** Show a backdrop overlay. Default true. When false no backdrop is rendered or managed. */
  overlay?: boolean;
  /** Close on backdrop click. Default true. */
  closeOnBackdrop?: boolean;
  /** Close on Escape. Default true. */
  closeOnEscape?: boolean;
  /** Called after the drawer fully closes. */
  onClose?: () => void;
  onOpen?: () => void;
}

interface ActiveDrawerState {
  close: () => void;
  backdrop: HTMLElement | null;
}

const activeDrawers = new WeakMap<HTMLElement, ActiveDrawerState>();

function getTransitionTimeMs(element: HTMLElement): number {
  const style = window.getComputedStyle(element);
  const durations = style.transitionDuration.split(",");
  const delays = style.transitionDelay.split(",");

  return durations.reduce((max, duration, index) => {
    const delay = delays[index] ?? delays[delays.length - 1] ?? "0s";
    const total = parseTimeMs(duration) + parseTimeMs(delay);
    return Math.max(max, total);
  }, 0);
}

function parseTimeMs(value: string): number {
  const trimmed = value.trim();
  if (trimmed.endsWith("ms")) {
    return Number.parseFloat(trimmed);
  }

  if (trimmed.endsWith("s")) {
    return Number.parseFloat(trimmed) * 1000;
  }

  return 0;
}

function syncDrawerState(drawer: HTMLElement, backdrop: HTMLElement | null, isOpen: boolean) {
  if (!drawer.hasAttribute("role")) {
    drawer.setAttribute("role", "dialog");
  }

  if (isOpen) {
    drawer.hidden = false;
    drawer.setAttribute("aria-hidden", "false");
    drawer.setAttribute("aria-modal", "true");
    if (backdrop) {
      backdrop.hidden = false;
      backdrop.setAttribute("aria-hidden", "true");
    }
    return;
  }

  drawer.setAttribute("aria-hidden", "true");
  drawer.removeAttribute("aria-modal");
  if (backdrop) {
    backdrop.setAttribute("aria-hidden", "true");
  }
}

function afterDrawerTransition(drawer: HTMLElement, backdrop: HTMLElement | null, callback: () => void) {
  const timeoutMs = Math.max(
    getTransitionTimeMs(drawer),
    backdrop ? getTransitionTimeMs(backdrop) : 0,
  );

  if (timeoutMs <= 0) {
    callback();
    return;
  }

  let settled = false;

  const finish = () => {
    if (settled) {
      return;
    }

    settled = true;
    drawer.removeEventListener("transitionend", onTransitionEnd);
    backdrop?.removeEventListener("transitionend", onTransitionEnd);
    window.clearTimeout(timer);
    callback();
  };

  const onTransitionEnd = (event: TransitionEvent) => {
    if (event.target === drawer || event.target === backdrop) {
      finish();
    }
  };

  const timer = window.setTimeout(finish, timeoutMs + 32);

  drawer.addEventListener("transitionend", onTransitionEnd);
  backdrop?.addEventListener("transitionend", onTransitionEnd);
}

export function openDrawer(options: DrawerOptions): void {
  const {
    drawer,
    overlay = true,
    closeOnBackdrop = true,
    closeOnEscape = true,
    onClose,
    onOpen,
  } = options;

  let backdrop: HTMLElement | null = options.backdrop ?? null;

  if (overlay && !backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "drawer-backdrop";
    document.body.appendChild(backdrop);
  }

  // Ensure drawer is in the DOM (may have been outside)
  if (!document.body.contains(drawer)) {
    document.body.appendChild(drawer);
  }

  syncDrawerState(drawer, backdrop, true);
  document.body.classList.add("drawer-open");
  document.body.style.overflow = "hidden";

  // Force reflow before adding is-open so transition fires
  if (backdrop) {
    void backdrop.offsetWidth;
    backdrop.classList.add("is-open");
  }
  drawer.classList.add("is-open");

  const releaseTrap = trapFocus(drawer);
  const restoreFocusTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  requestAnimationFrame(() => {
    const first = drawer.querySelector<HTMLElement>(
      "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
    );
    first?.focus();
  });

  let isClosing = false;

  const onBackdropClick = (e: MouseEvent) => {
    if (e.target === backdrop) {
      close();
    }
  };

  const onKey = (e: KeyboardEvent) => {
    if (closeOnEscape && e.key === "Escape") {
      close();
    }
  };

  const close = () => {
    if (isClosing) {
      return;
    }

    isClosing = true;
    releaseTrap();
    backdrop?.classList.remove("is-open");
    drawer.classList.remove("is-open");
    syncDrawerState(drawer, backdrop, false);
    backdrop?.removeEventListener("click", onBackdropClick);
    document.removeEventListener("keydown", onKey);
    activeDrawers.delete(drawer);

    afterDrawerTransition(drawer, backdrop, () => {
      drawer.hidden = true;
      if (backdrop) backdrop.hidden = true;
      document.body.classList.remove("drawer-open");
      document.body.style.overflow = "";
      if (restoreFocusTo && document.contains(restoreFocusTo)) {
        restoreFocusTo.focus();
      }
      onClose?.();
    });
  };

  activeDrawers.set(drawer, { close, backdrop });

  if (closeOnBackdrop) {
    backdrop.addEventListener("click", onBackdropClick);
  }

  document.addEventListener("keydown", onKey);
  onOpen?.();
}

export function closeDrawer(options: { drawer: HTMLElement; backdrop?: HTMLElement; onClose?: () => void }): void {
  const { drawer, backdrop, onClose } = options;
  const active = activeDrawers.get(drawer);
  if (active) {
    active.close();
    return;
  }
  const targetBackdrop = backdrop ?? document.createElement("div");
  syncDrawerState(drawer, targetBackdrop, false);
  backdrop?.classList.remove("is-open");
  drawer.classList.remove("is-open");
  drawer.hidden = true;
  backdrop?.setAttribute("aria-hidden", "true");
  if (backdrop) {
    backdrop.hidden = true;
  }
  document.body.classList.remove("drawer-open");
  document.body.style.overflow = "";
  onClose?.();
}
