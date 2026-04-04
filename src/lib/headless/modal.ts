import { trapFocus, FOCUSABLE } from "./focus-trap";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ModalOptions {
  /** The modal backdrop element (contains the card). */
  backdrop: HTMLElement;
  /** Render the dark overlay behind the card. Default true. */
  showBackdrop?: boolean;
  /** Allow the card to be repositioned by dragging its header. Default false. */
  draggable?: boolean;
  /** Close when clicking the backdrop outside the card. Default true. */
  closeOnBackdrop?: boolean;
  /** Close on Escape key. Default true. */
  closeOnEscape?: boolean;
  /** Called after the modal closes via any path. */
  onClose?: () => void;
  /** Called when the accept button is activated. */
  onAccept?: () => void;
  /** Called when the reject button or any dismiss action is invoked. */
  onReject?: () => void;
  /** CSS selector for the accept button within the backdrop. Default ".modal-btn-accept". */
  acceptBtnSelector?: string;
  /** CSS selector for the reject button(s) within the backdrop. Default ".modal-btn-reject". */
  rejectBtnSelector?: string;
}

export interface ConfirmOptions {
  /** Modal heading. */
  title: string;
  /** Body paragraph shown below the title. */
  message?: string;
  /** Label for the accept/primary action button. Default "Confirm". */
  acceptLabel?: string;
  /** Label for the reject/cancel button. Default "Cancel". */
  rejectLabel?: string;
  /**
   * Visual variant of the accept button.
   * - "default"  — accent purple (safe actions)
   * - "danger"   — error red (destructive actions)
   */
  variant?: "default" | "danger";
  /** Render the dark overlay behind the card. Default true. */
  showBackdrop?: boolean;
  /** Allow the card to be repositioned by dragging its header. Default false. */
  draggable?: boolean;
  /** Close when clicking outside the card. Default true. */
  closeOnBackdrop?: boolean;
  /** Close on Escape (counts as reject). Default true. */
  closeOnEscape?: boolean;
}

// ── Drag helper ───────────────────────────────────────────────────────────────

function makeDraggable(card: HTMLElement, handle: HTMLElement): () => void {
  card.classList.add("modal-card--draggable");

  let dx = 0;
  let dy = 0;
  let startX = 0;
  let startY = 0;

  function onMouseMove(e: MouseEvent) {
    dx = e.clientX - startX;
    dy = e.clientY - startY;
    card.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  function onMouseUp() {
    card.classList.remove("is-dragging");
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }

  function onMouseDown(e: MouseEvent) {
    // Ignore clicks on interactive children (buttons, inputs)
    if ((e.target as HTMLElement).closest("button, input, select, textarea, a")) return;
    startX = e.clientX - dx;
    startY = e.clientY - dy;
    card.classList.add("is-dragging");
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp, { once: true });
  }

  handle.addEventListener("mousedown", onMouseDown);

  return () => {
    handle.removeEventListener("mousedown", onMouseDown);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    card.style.transform = "";
    card.classList.remove("modal-card--draggable", "is-dragging");
  };
}

// ── Core open / close ─────────────────────────────────────────────────────────

export function openModal(options: ModalOptions) {
  const {
    backdrop,
    showBackdrop = true,
    draggable = false,
    closeOnBackdrop = true,
    closeOnEscape = true,
    onClose,
    onAccept,
    onReject,
    acceptBtnSelector = ".modal-btn-accept",
    rejectBtnSelector = ".modal-btn-reject",
  } = options;

  backdrop.removeAttribute("hidden");

  if (!showBackdrop) {
    backdrop.classList.add("modal-backdrop--none");
  } else {
    backdrop.classList.remove("modal-backdrop--none");
    document.body.classList.add("modal-open");
  }

  const card = backdrop.querySelector<HTMLElement>(".modal-card");
  const releaseTrap = card ? trapFocus(card) : () => {};

  let releaseDrag: (() => void) | undefined;
  if (draggable && card) {
    const handle = card.querySelector<HTMLElement>(".modal-header") ?? card;
    releaseDrag = makeDraggable(card, handle);
  }

  requestAnimationFrame(() => {
    const first = card?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
  });

  const close = () => {
    releaseTrap();
    releaseDrag?.();
    closeModal({ backdrop, onClose });
  };

  const accept = () => { close(); onAccept?.(); };
  const reject = () => { close(); onReject?.(); };

  backdrop
    .querySelectorAll<HTMLElement>(acceptBtnSelector)
    .forEach((btn) => btn.addEventListener("click", accept, { once: true }));

  backdrop
    .querySelectorAll<HTMLElement>(rejectBtnSelector)
    .forEach((btn) => btn.addEventListener("click", reject, { once: true }));

  if (closeOnBackdrop && showBackdrop) {
    backdrop.addEventListener(
      "click",
      (e) => { if (e.target === backdrop) reject(); },
      { once: true }
    );
  }

  if (closeOnEscape) {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        reject();
        document.removeEventListener("keydown", onKey);
      }
    };
    document.addEventListener("keydown", onKey);
  }
}

export function closeModal(options: { backdrop: HTMLElement; onClose?: () => void }) {
  const { backdrop, onClose } = options;
  backdrop.setAttribute("hidden", "");
  if (!backdrop.classList.contains("modal-backdrop--none")) {
    document.body.classList.remove("modal-open");
  }
  onClose?.();
}

// ── Declarative helper ────────────────────────────────────────────────────────

export function bindModal(
  triggerId: string,
  backdropId: string,
  options: Omit<ModalOptions, "backdrop"> = {}
) {
  const trigger = document.getElementById(triggerId);
  const backdrop = document.getElementById(backdropId);
  if (!backdrop) return;

  trigger?.addEventListener("click", () => openModal({ backdrop, ...options }));
}

// ── Programmatic confirm ──────────────────────────────────────────────────────

const CLOSE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
</svg>`;

export function confirmModal(options: ConfirmOptions): Promise<boolean> {
  const {
    title,
    message,
    acceptLabel = "Confirm",
    rejectLabel = "Cancel",
    variant = "default",
    showBackdrop = true,
    draggable = false,
    closeOnBackdrop = true,
    closeOnEscape = true,
  } = options;

  return new Promise((resolve) => {
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";

    if (!showBackdrop) backdrop.classList.add("modal-backdrop--none");

    const card = document.createElement("div");
    card.className = "modal-card";
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-modal", "true");

    const header = document.createElement("div");
    header.className = "modal-header";

    const heading = document.createElement("h3");
    heading.textContent = title;

    const xBtn = document.createElement("button");
    xBtn.className = "icon-btn modal-close-btn modal-btn-reject";
    xBtn.setAttribute("aria-label", "Close");
    xBtn.innerHTML = CLOSE_SVG;

    header.append(heading, xBtn);
    card.appendChild(header);

    if (message) {
      const body = document.createElement("p");
      body.className = "modal-body-text";
      body.textContent = message;
      card.appendChild(body);
    }

    const footer = document.createElement("div");
    footer.className = "modal-footer";

    const rejectBtn = document.createElement("button");
    rejectBtn.className = "secondary-btn modal-btn-reject";
    rejectBtn.textContent = rejectLabel;

    const acceptBtn = document.createElement("button");
    acceptBtn.className = `modal-btn-accept${variant === "danger" ? " danger" : ""}`;
    acceptBtn.textContent = acceptLabel;

    footer.append(rejectBtn, acceptBtn);
    card.appendChild(footer);
    backdrop.appendChild(card);
    document.body.appendChild(backdrop);

    if (showBackdrop) document.body.classList.add("modal-open");

    const releaseTrap = trapFocus(card);

    let releaseDrag: (() => void) | undefined;
    if (draggable) releaseDrag = makeDraggable(card, header);

    requestAnimationFrame(() => rejectBtn.focus());

    const teardown = () => {
      releaseTrap();
      releaseDrag?.();
      backdrop.remove();
      if (showBackdrop) document.body.classList.remove("modal-open");
    };

    const accept = () => { teardown(); resolve(true); };
    const reject = () => { teardown(); resolve(false); };

    acceptBtn.addEventListener("click", accept, { once: true });
    backdrop
      .querySelectorAll<HTMLElement>(".modal-btn-reject")
      .forEach((btn) => btn.addEventListener("click", reject, { once: true }));

    if (closeOnBackdrop && showBackdrop) {
      backdrop.addEventListener(
        "click",
        (e) => { if (e.target === backdrop) reject(); },
        { once: true }
      );
    }

    if (closeOnEscape) {
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          reject();
          document.removeEventListener("keydown", onKey);
        }
      };
      document.addEventListener("keydown", onKey);
    }
  });
}
