// ── Types ─────────────────────────────────────────────────────────────────────

export interface ModalOptions {
  /** The modal backdrop element (contains the card). */
  backdrop: HTMLElement;
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
  /** Close when clicking outside the card. Default true. */
  closeOnBackdrop?: boolean;
  /** Close on Escape (counts as reject). Default true. */
  closeOnEscape?: boolean;
}

// ── Core open / close ─────────────────────────────────────────────────────────

export function openModal(options: ModalOptions) {
  const {
    backdrop,
    closeOnBackdrop = true,
    closeOnEscape = true,
    onClose,
    onAccept,
    onReject,
    acceptBtnSelector = ".modal-btn-accept",
    rejectBtnSelector = ".modal-btn-reject",
  } = options;

  backdrop.removeAttribute("hidden");
  document.body.classList.add("modal-open");

  const accept = () => {
    closeModal({ backdrop, onClose });
    onAccept?.();
  };

  const reject = () => {
    closeModal({ backdrop, onClose });
    onReject?.();
  };

  // Wire buttons found inside the backdrop
  backdrop
    .querySelectorAll<HTMLElement>(acceptBtnSelector)
    .forEach((btn) => btn.addEventListener("click", accept, { once: true }));

  backdrop
    .querySelectorAll<HTMLElement>(rejectBtnSelector)
    .forEach((btn) => btn.addEventListener("click", reject, { once: true }));

  if (closeOnBackdrop) {
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
  document.body.classList.remove("modal-open");
  onClose?.();
}

// ── Declarative helper ────────────────────────────────────────────────────────

/**
 * Wire a trigger button and optional close/reject/accept buttons to a modal
 * backdrop by element ids.
 */
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

/**
 * Show a self-contained confirm modal and return a Promise that resolves to
 * `true` (accept) or `false` (reject / dismiss).
 *
 * @example
 *   const ok = await confirmModal({ title: "Delete file?", variant: "danger" });
 *   if (ok) deleteFile();
 */
export function confirmModal(options: ConfirmOptions): Promise<boolean> {
  const {
    title,
    message,
    acceptLabel = "Confirm",
    rejectLabel = "Cancel",
    variant = "default",
    closeOnBackdrop = true,
    closeOnEscape = true,
  } = options;

  return new Promise((resolve) => {
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";

    const card = document.createElement("div");
    card.className = "modal-card";
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-modal", "true");

    // Header
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

    // Body
    if (message) {
      const body = document.createElement("p");
      body.className = "modal-body-text";
      body.textContent = message;
      card.appendChild(body);
    }

    // Footer
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
    document.body.classList.add("modal-open");

    // Focus the safe-default button (reject) when opened
    requestAnimationFrame(() => rejectBtn.focus());

    const teardown = () => {
      backdrop.remove();
      document.body.classList.remove("modal-open");
    };

    const accept = () => { teardown(); resolve(true); };
    const reject = () => { teardown(); resolve(false); };

    acceptBtn.addEventListener("click", accept, { once: true });
    backdrop
      .querySelectorAll<HTMLElement>(".modal-btn-reject")
      .forEach((btn) => btn.addEventListener("click", reject, { once: true }));

    if (closeOnBackdrop) {
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
