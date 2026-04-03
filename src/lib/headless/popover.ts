export type PopoverPlacement = "top" | "bottom" | "left" | "right";
export type PopoverTrigger = "click" | "hover";

export interface PopoverOptions {
  /** The element that triggers the popover. */
  anchor: HTMLElement;
  /** The `.popover` element to show/hide. */
  content: HTMLElement;
  /** Default "bottom". */
  placement?: PopoverPlacement;
  /** "click" toggles on click; "hover" shows on mouseenter. Default "click". */
  trigger?: PopoverTrigger;
  /** Offset in px from anchor. Default 8. */
  offset?: number;
  /** Called when popover opens. */
  onOpen?: () => void;
  /** Called when popover closes. */
  onClose?: () => void;
}

export interface PopoverHandle {
  open(): void;
  close(): void;
  toggle(): void;
  destroy(): void;
}

export function bindPopover(options: PopoverOptions): PopoverHandle {
  const {
    anchor,
    content,
    placement = "bottom",
    trigger = "click",
    offset = 8,
    onOpen,
    onClose,
  } = options;

  // Move content to body so it can escape overflow:hidden containers
  if (!document.body.contains(content)) document.body.appendChild(content);

  content.style.position = "absolute";
  content.style.zIndex = String(getComputedStyle(document.documentElement).getPropertyValue("--z-dropdown").trim() || "100");

  anchor.setAttribute("aria-expanded", "false");

  let currentPlacement = placement;

  function position() {
    const ar = anchor.getBoundingClientRect();
    const cr = content.getBoundingClientRect();
    const scroll = { x: window.scrollX, y: window.scrollY };
    let top = 0, left = 0;
    const placements: PopoverPlacement[] = [placement, placement === "top" ? "bottom" : placement === "bottom" ? "top" : placement === "left" ? "right" : "left"];

    for (const candidate of placements) {
      currentPlacement = candidate;
      switch (candidate) {
        case "bottom":
          top  = ar.bottom + scroll.y + offset;
          left = ar.left + scroll.x + ar.width / 2 - cr.width / 2;
          break;
        case "top":
          top  = ar.top + scroll.y - cr.height - offset;
          left = ar.left + scroll.x + ar.width / 2 - cr.width / 2;
          break;
        case "left":
          top  = ar.top + scroll.y + ar.height / 2 - cr.height / 2;
          left = ar.left + scroll.x - cr.width - offset;
          break;
        case "right":
          top  = ar.top + scroll.y + ar.height / 2 - cr.height / 2;
          left = ar.right + scroll.x + offset;
          break;
      }

      if (left >= 8 && top >= 8 && left + cr.width <= window.innerWidth + scroll.x - 8 && top + cr.height <= window.innerHeight + scroll.y - 8) {
        break;
      }
    }

    // Clamp to viewport
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    left = Math.max(8, Math.min(left, vw + scroll.x - cr.width - 8));
    top  = Math.max(8, Math.min(top,  vh + scroll.y - cr.height - 8));

    content.style.top  = `${top}px`;
    content.style.left = `${left}px`;
    content.dataset["placement"] = currentPlacement;
  }

  function open() {
    position();
    content.classList.add("is-open");
    anchor.setAttribute("aria-expanded", "true");
    onOpen?.();
  }

  function close() {
    content.classList.remove("is-open");
    anchor.setAttribute("aria-expanded", "false");
    onClose?.();
  }

  function toggle() {
    content.classList.contains("is-open") ? close() : open();
  }

  const outsideClick = (e: MouseEvent) => {
    if (!content.contains(e.target as Node) && !anchor.contains(e.target as Node)) close();
  };

  const onEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") { close(); anchor.focus(); }
  };

  if (trigger === "click") {
    anchor.addEventListener("click", toggle);
    document.addEventListener("click", outsideClick);
    document.addEventListener("keydown", onEscape);
  } else {
    anchor.addEventListener("mouseenter", open);
    anchor.addEventListener("mouseleave", () => {
      // Delay so user can move cursor into the popover
      setTimeout(() => {
        if (!content.matches(":hover") && !anchor.matches(":hover")) close();
      }, 80);
    });
    content.addEventListener("mouseleave", () => {
      if (!anchor.matches(":hover")) close();
    });
  }

  return {
    open,
    close,
    toggle,
    destroy() {
      anchor.removeEventListener("click", toggle);
      document.removeEventListener("click", outsideClick);
      document.removeEventListener("keydown", onEscape);
    },
  };
}
