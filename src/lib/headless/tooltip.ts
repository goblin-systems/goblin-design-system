export interface TooltipHandle {
  destroy(): void;
}

export interface TooltipOptions {
  root?: ParentNode;
  showDelayMs?: number;
  hideDelayMs?: number;
}

const TOOLTIP_SELECTOR = "[data-tooltip]";

type Cleanup = () => void;

function measureSide(anchor: HTMLElement, side: string) {
  const rect = anchor.getBoundingClientRect();
  const width = Math.min(Math.max(anchor.dataset["tooltip" ]?.length ?? 16, 12) * 7, 240);
  const height = 30;

  switch (side) {
    case "bottom":
      return { top: rect.bottom + 8, bottom: rect.bottom + 8 + height, left: rect.left + rect.width / 2 - width / 2, right: rect.left + rect.width / 2 + width / 2 };
    case "left":
      return { top: rect.top + rect.height / 2 - height / 2, bottom: rect.top + rect.height / 2 + height / 2, left: rect.left - width - 8, right: rect.left - 8 };
    case "right":
      return { top: rect.top + rect.height / 2 - height / 2, bottom: rect.top + rect.height / 2 + height / 2, left: rect.right + 8, right: rect.right + width + 8 };
    default:
      return { top: rect.top - height - 8, bottom: rect.top - 8, left: rect.left + rect.width / 2 - width / 2, right: rect.left + rect.width / 2 + width / 2 };
  }
}

function flipPlacement(anchor: HTMLElement) {
  const requested = anchor.dataset["tooltipPlacement"] ?? "top";
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const ordered = [requested];

  if (requested === "top") ordered.push("bottom", "right", "left");
  else if (requested === "bottom") ordered.push("top", "right", "left");
  else if (requested === "left") ordered.push("right", "top", "bottom");
  else ordered.push("left", "top", "bottom");

  for (const side of ordered) {
    const next = measureSide(anchor, side);
    if (next.left >= 8 && next.right <= viewportWidth - 8 && next.top >= 8 && next.bottom <= viewportHeight - 8) {
      return side;
    }
  }

  return requested;
}

export function bindTooltips(options: TooltipOptions = {}): TooltipHandle {
  const { root = document, showDelayMs = 400, hideDelayMs = 80 } = options;
  const cleanups: Cleanup[] = [];

  root.querySelectorAll<HTMLElement>(TOOLTIP_SELECTOR).forEach((anchor) => {
    let showTimer: ReturnType<typeof setTimeout> | null = null;
    let hideTimer: ReturnType<typeof setTimeout> | null = null;

    const clearTimers = () => {
      if (showTimer) clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
      showTimer = null;
      hideTimer = null;
    };

    const show = (immediate = false) => {
      clearTimers();
      const run = () => {
        anchor.dataset["tooltipSide"] = flipPlacement(anchor);
        anchor.dataset["tooltipVisible"] = "true";
      };

      if (immediate) {
        run();
        return;
      }

      showTimer = setTimeout(run, showDelayMs);
    };

    const hide = () => {
      clearTimers();
      hideTimer = setTimeout(() => {
        delete anchor.dataset["tooltipVisible"];
      }, hideDelayMs);
    };

    const onMouseEnter = () => show(false);
    const onMouseLeave = () => hide();
    const onFocus = () => show(true);
    const onBlur = () => hide();

    anchor.addEventListener("mouseenter", onMouseEnter);
    anchor.addEventListener("mouseleave", onMouseLeave);
    anchor.addEventListener("focus", onFocus, true);
    anchor.addEventListener("blur", onBlur, true);

    cleanups.push(() => {
      clearTimers();
      anchor.removeEventListener("mouseenter", onMouseEnter);
      anchor.removeEventListener("mouseleave", onMouseLeave);
      anchor.removeEventListener("focus", onFocus, true);
      anchor.removeEventListener("blur", onBlur, true);
      delete anchor.dataset["tooltipVisible"];
      delete anchor.dataset["tooltipSide"];
    });
  });

  return {
    destroy() {
      cleanups.forEach((cleanup) => cleanup());
    },
  };
}
