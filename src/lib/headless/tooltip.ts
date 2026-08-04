export interface TooltipHandle {
  destroy(): void;
}

export interface TooltipOptions {
  root?: ParentNode;
  showDelayMs?: number;
  hideDelayMs?: number;
}

type TooltipSide = "top" | "bottom" | "left" | "right";

const TOOLTIP_SELECTOR = "[data-tooltip]";
const VIEWPORT_MARGIN = 8;
const ANCHOR_GAP = 8;
const bindings = new WeakMap<ParentNode, TooltipHandle>();
const owners = new WeakMap<HTMLElement, object>();
let nextTooltipId = 0;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function requestedSide(anchor: HTMLElement): TooltipSide {
  const side = anchor.dataset["tooltipPlacement"];
  return side === "bottom" || side === "left" || side === "right" ? side : "top";
}

function sideOrder(requested: TooltipSide): TooltipSide[] {
  if (requested === "top") return ["top", "bottom", "right", "left"];
  if (requested === "bottom") return ["bottom", "top", "right", "left"];
  if (requested === "left") return ["left", "right", "top", "bottom"];
  return ["right", "left", "top", "bottom"];
}

function coordinates(side: TooltipSide, anchor: DOMRect, width: number, height: number): { left: number; top: number } {
  if (side === "bottom") {
    return { left: anchor.left + (anchor.width - width) / 2, top: anchor.bottom + ANCHOR_GAP };
  }
  if (side === "left") {
    return { left: anchor.left - width - ANCHOR_GAP, top: anchor.top + (anchor.height - height) / 2 };
  }
  if (side === "right") {
    return { left: anchor.right + ANCHOR_GAP, top: anchor.top + (anchor.height - height) / 2 };
  }
  return { left: anchor.left + (anchor.width - width) / 2, top: anchor.top - height - ANCHOR_GAP };
}

function visibleArea(
  left: number,
  top: number,
  width: number,
  height: number,
  viewport: { left: number; top: number; right: number; bottom: number },
): number {
  const visibleWidth = Math.max(0, Math.min(left + width, viewport.right) - Math.max(left, viewport.left));
  const visibleHeight = Math.max(0, Math.min(top + height, viewport.bottom) - Math.max(top, viewport.top));
  return visibleWidth * visibleHeight;
}

/**
 * Bind one delegated tooltip layer to a root. Tooltip content is portalled to
 * the document body so clipped panes cannot cut it off. Calling this again for
 * the same root returns the existing handle.
 */
export function bindTooltips(options: TooltipOptions = {}): TooltipHandle {
  const { root = document, showDelayMs = 400, hideDelayMs = 80 } = options;
  const existing = bindings.get(root);
  if (existing) return existing;

  const rootNode = root as Node;
  const doc = rootNode.ownerDocument ?? (root instanceof Document ? root : document);
  const view = doc.defaultView ?? window;
  const eventRoot = root as ParentNode & EventTarget;
  const owner = {};
  const tooltip = doc.createElement("div");
  tooltip.id = `tooltip-portal-${++nextTooltipId}`;
  tooltip.className = "tooltip-portal";
  tooltip.setAttribute("role", "tooltip");
  tooltip.hidden = true;
  (doc.body ?? doc.documentElement).appendChild(tooltip);

  let activeAnchor: HTMLElement | null = null;
  let hoveredAnchor: HTMLElement | null = null;
  let focusedAnchor: HTMLElement | null = null;
  let showTimer: ReturnType<typeof setTimeout> | null = null;
  let hideTimer: ReturnType<typeof setTimeout> | null = null;
  let destroyed = false;

  const findAnchor = (target: EventTarget | null): HTMLElement | null => {
    if (!(target instanceof Element)) return null;
    const anchor = target.closest<HTMLElement>(TOOLTIP_SELECTOR);
    if (!anchor || !rootNode.contains(anchor)) return null;
    return anchor;
  };

  const clearTimers = () => {
    if (showTimer !== null) clearTimeout(showTimer);
    if (hideTimer !== null) clearTimeout(hideTimer);
    showTimer = null;
    hideTimer = null;
  };

  const removeDescription = (anchor: HTMLElement) => {
    const ids = (anchor.getAttribute("aria-describedby") ?? "")
      .split(/\s+/)
      .filter((id) => id && id !== tooltip.id);
    if (ids.length) anchor.setAttribute("aria-describedby", ids.join(" "));
    else anchor.removeAttribute("aria-describedby");
  };

  const hideNow = () => {
    if (activeAnchor) {
      removeDescription(activeAnchor);
      if (owners.get(activeAnchor) === owner) owners.delete(activeAnchor);
      delete activeAnchor.dataset["tooltipBound"];
      delete activeAnchor.dataset["tooltipVisible"];
      delete activeAnchor.dataset["tooltipSide"];
    }
    activeAnchor = null;
    tooltip.dataset["visible"] = "false";
    tooltip.hidden = true;
  };

  const position = () => {
    if (!activeAnchor || tooltip.hidden) return;
    if (!activeAnchor.isConnected) {
      hideNow();
      return;
    }

    const visualViewport = view.visualViewport;
    const viewport = {
      left: visualViewport?.offsetLeft ?? 0,
      top: visualViewport?.offsetTop ?? 0,
      right: (visualViewport?.offsetLeft ?? 0) + (visualViewport?.width ?? view.innerWidth),
      bottom: (visualViewport?.offsetTop ?? 0) + (visualViewport?.height ?? view.innerHeight),
    };
    const anchorRect = activeAnchor.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const width = tooltipRect.width;
    const height = tooltipRect.height;
    const candidates = sideOrder(requestedSide(activeAnchor)).map((side) => ({
      side,
      ...coordinates(side, anchorRect, width, height),
    }));
    const fits = (candidate: { left: number; top: number }) =>
      candidate.left >= viewport.left + VIEWPORT_MARGIN &&
      candidate.top >= viewport.top + VIEWPORT_MARGIN &&
      candidate.left + width <= viewport.right - VIEWPORT_MARGIN &&
      candidate.top + height <= viewport.bottom - VIEWPORT_MARGIN;
    const chosen = candidates.find(fits) ?? candidates.reduce((best, candidate) =>
      visibleArea(candidate.left, candidate.top, width, height, viewport) >
      visibleArea(best.left, best.top, width, height, viewport)
        ? candidate
        : best,
    );

    const minLeft = viewport.left + VIEWPORT_MARGIN;
    const minTop = viewport.top + VIEWPORT_MARGIN;
    const maxLeft = Math.max(minLeft, viewport.right - width - VIEWPORT_MARGIN);
    const maxTop = Math.max(minTop, viewport.bottom - height - VIEWPORT_MARGIN);
    const left = clamp(chosen.left, minLeft, maxLeft);
    const top = clamp(chosen.top, minTop, maxTop);
    tooltip.style.left = `${Math.round(left)}px`;
    tooltip.style.top = `${Math.round(top)}px`;
    tooltip.dataset["side"] = chosen.side;
    activeAnchor.dataset["tooltipSide"] = chosen.side;

    const horizontal = chosen.side === "top" || chosen.side === "bottom";
    const anchorCenter = horizontal
      ? anchorRect.left + anchorRect.width / 2 - left
      : anchorRect.top + anchorRect.height / 2 - top;
    const size = horizontal ? width : height;
    tooltip.style.setProperty(
      "--tooltip-arrow-offset",
      `${Math.round(clamp(anchorCenter, 8, Math.max(8, size - 8)))}px`,
    );
  };

  const show = (anchor: HTMLElement, immediate: boolean) => {
    clearTimers();
    const run = () => {
      const content = anchor.dataset["tooltip"]?.trim();
      if (!content || !anchor.isConnected) return;
      const currentOwner = owners.get(anchor);
      if (currentOwner && currentOwner !== owner) return;
      if (activeAnchor && activeAnchor !== anchor) hideNow();

      owners.set(anchor, owner);
      activeAnchor = anchor;
      tooltip.textContent = content;
      tooltip.hidden = false;
      tooltip.dataset["visible"] = "false";
      const theme = anchor.closest<HTMLElement>("[data-theme]")?.dataset["theme"];
      if (theme) tooltip.dataset["theme"] = theme;
      else delete tooltip.dataset["theme"];
      const maxWidth = view.getComputedStyle(anchor).getPropertyValue("--tooltip-max-width").trim();
      if (maxWidth) tooltip.style.setProperty("--tooltip-max-width", maxWidth);
      else tooltip.style.removeProperty("--tooltip-max-width");

      const describedBy = new Set(
        (anchor.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean),
      );
      describedBy.add(tooltip.id);
      anchor.setAttribute("aria-describedby", [...describedBy].join(" "));
      anchor.dataset["tooltipBound"] = "true";
      anchor.dataset["tooltipVisible"] = "true";
      position();
      tooltip.dataset["visible"] = "true";
    };

    if (immediate || showDelayMs <= 0) run();
    else showTimer = setTimeout(run, showDelayMs);
  };

  const hide = () => {
    if (showTimer !== null) clearTimeout(showTimer);
    showTimer = null;
    if (hideTimer !== null) clearTimeout(hideTimer);
    if (hideDelayMs <= 0) hideNow();
    else hideTimer = setTimeout(hideNow, hideDelayMs);
  };

  const onMouseOver = (event: Event) => {
    const anchor = findAnchor(event.target);
    if (!anchor || anchor === hoveredAnchor) return;
    hoveredAnchor = anchor;
    show(anchor, false);
  };
  const onMouseOut = (event: Event) => {
    const anchor = findAnchor(event.target);
    if (!anchor || anchor !== hoveredAnchor) return;
    const related = event instanceof MouseEvent ? event.relatedTarget : null;
    if (related instanceof Node && anchor.contains(related)) return;
    hoveredAnchor = null;
    if (focusedAnchor !== anchor) hide();
  };
  const onFocusIn = (event: Event) => {
    const anchor = findAnchor(event.target);
    if (!anchor) return;
    focusedAnchor = anchor;
    show(anchor, true);
  };
  const onFocusOut = (event: Event) => {
    const anchor = findAnchor(event.target);
    if (!anchor || anchor !== focusedAnchor) return;
    const related = event instanceof FocusEvent ? event.relatedTarget : null;
    if (related instanceof Node && anchor.contains(related)) return;
    focusedAnchor = null;
    if (hoveredAnchor !== anchor) hide();
  };
  const onKeyDown = (event: Event) => {
    if (event instanceof KeyboardEvent && event.key === "Escape") hideNow();
  };

  eventRoot.addEventListener("mouseover", onMouseOver);
  eventRoot.addEventListener("mouseout", onMouseOut);
  eventRoot.addEventListener("focusin", onFocusIn);
  eventRoot.addEventListener("focusout", onFocusOut);
  eventRoot.addEventListener("keydown", onKeyDown);
  view.addEventListener("scroll", position, true);
  view.addEventListener("resize", position);
  view.visualViewport?.addEventListener("scroll", position);
  view.visualViewport?.addEventListener("resize", position);

  const observer = new MutationObserver(() => {
    if (activeAnchor && !activeAnchor.isConnected) {
      hoveredAnchor = null;
      focusedAnchor = null;
      hideNow();
    }
  });
  observer.observe(rootNode, { childList: true, subtree: true });

  const handle: TooltipHandle = {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      clearTimers();
      hideNow();
      eventRoot.removeEventListener("mouseover", onMouseOver);
      eventRoot.removeEventListener("mouseout", onMouseOut);
      eventRoot.removeEventListener("focusin", onFocusIn);
      eventRoot.removeEventListener("focusout", onFocusOut);
      eventRoot.removeEventListener("keydown", onKeyDown);
      view.removeEventListener("scroll", position, true);
      view.removeEventListener("resize", position);
      view.visualViewport?.removeEventListener("scroll", position);
      view.visualViewport?.removeEventListener("resize", position);
      observer.disconnect();
      tooltip.remove();
      if (bindings.get(root) === handle) bindings.delete(root);
    },
  };

  bindings.set(root, handle);
  return handle;
}
