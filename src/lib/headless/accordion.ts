export interface AccordionOptions {
  /** The `.accordion` container element. */
  el: HTMLElement;
  /** Allow multiple panels open simultaneously. Default false. */
  multiple?: boolean;
  /** Called when a panel opens or closes. */
  onChange?: (itemEl: HTMLElement, open: boolean) => void;
}

export interface AccordionHandle {
  open(itemEl: HTMLElement): void;
  close(itemEl: HTMLElement): void;
  toggle(itemEl: HTMLElement): void;
  destroy(): void;
}

export function bindAccordion(options: AccordionOptions): AccordionHandle {
  const { el, multiple = false, onChange } = options;

  const items = () => Array.from(el.querySelectorAll<HTMLElement>(":scope > .accordion-item"));

  function open(item: HTMLElement) {
    if (!multiple) {
      items().forEach((i) => { if (i !== item) close(i); });
    }
    item.classList.add("is-open");
    const trigger = item.querySelector<HTMLElement>(".accordion-trigger");
    trigger?.setAttribute("aria-expanded", "true");
    onChange?.(item, true);
  }

  function close(item: HTMLElement) {
    item.classList.remove("is-open");
    const trigger = item.querySelector<HTMLElement>(".accordion-trigger");
    trigger?.setAttribute("aria-expanded", "false");
    onChange?.(item, false);
  }

  function toggle(item: HTMLElement) {
    item.classList.contains("is-open") ? close(item) : open(item);
  }

  const handlers = new Map<HTMLElement, () => void>();
  const keyHandlers = new Map<HTMLElement, (e: KeyboardEvent) => void>();

  items().forEach((item, idx) => {
    const trigger = item.querySelector<HTMLElement>(".accordion-trigger");
    const panel = item.querySelector<HTMLElement>(".accordion-panel");

    if (trigger && panel) {
      // ARIA wiring
      const triggerId = `accordion-trigger-${idx}`;
      const panelId = `accordion-panel-${idx}`;
      trigger.id = trigger.id || triggerId;
      panel.id = panel.id || panelId;
      trigger.setAttribute("aria-controls", panel.id);
      trigger.setAttribute("aria-expanded", String(item.classList.contains("is-open")));
      panel.setAttribute("aria-labelledby", trigger.id);
      panel.setAttribute("role", "region");
    }

    const handler = () => toggle(item);
    handlers.set(item, handler);
    trigger?.addEventListener("click", handler);

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle(item);
        return;
      }

      const triggers = items()
        .map((accordionItem) => accordionItem.querySelector<HTMLElement>(".accordion-trigger"))
        .filter((value): value is HTMLElement => Boolean(value));
      const index = triggers.indexOf(trigger as HTMLElement);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        triggers[(index + 1) % triggers.length]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        triggers[(index - 1 + triggers.length) % triggers.length]?.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        triggers[0]?.focus();
      } else if (e.key === "End") {
        e.preventDefault();
        triggers[triggers.length - 1]?.focus();
      }
    };

    keyHandlers.set(item, keyHandler);
    trigger?.addEventListener("keydown", keyHandler);
  });

  return {
    open,
    close,
    toggle,
    destroy() {
      items().forEach((item) => {
        const trigger = item.querySelector<HTMLElement>(".accordion-trigger");
        const handler = handlers.get(item);
        if (trigger && handler) trigger.removeEventListener("click", handler);
        const keyHandler = keyHandlers.get(item);
        if (trigger && keyHandler) trigger.removeEventListener("keydown", keyHandler);
      });
      handlers.clear();
      keyHandlers.clear();
    },
  };
}
