export interface TabsOptions {
  /** Selector for tab trigger buttons (must have data-tab-trigger attribute). */
  triggerSelector?: string;
  /** Selector for tab panel elements (must have data-tab-panel attribute). */
  panelSelector?: string;
  /** Container to scope the query. Defaults to document. */
  root?: ParentNode;
  /** Callback when a tab changes. */
  onChange?: (tabId: string) => void;
}

export function bindTabs(options: TabsOptions = {}) {
  const {
    triggerSelector = "[data-tab-trigger]",
    panelSelector = "[data-tab-panel]",
    root = document,
    onChange,
  } = options;

  const triggers = Array.from(root.querySelectorAll<HTMLElement>(triggerSelector));
  const panels = Array.from(root.querySelectorAll<HTMLElement>(panelSelector));

  if (triggers.length === 0) {
    return {
      activate() {},
    };
  }

  // Set up tablist ARIA on the common parent if it wraps only these triggers
  const tablistEl = triggers[0]?.parentElement;
  if (tablistEl && triggers.every((t) => t.parentElement === tablistEl)) {
    tablistEl.setAttribute("role", "tablist");
    if (!tablistEl.hasAttribute("aria-orientation")) {
      tablistEl.setAttribute("aria-orientation", "horizontal");
    }
  }

  // Set up static ARIA on each trigger and panel
  triggers.forEach((t, index) => {
    t.setAttribute("role", "tab");
    t.setAttribute("aria-setsize", String(triggers.length));
    t.setAttribute("aria-posinset", String(index + 1));
    const id = t.dataset["tabTrigger"] ?? "";
    // Link trigger to its panel via aria-controls
    const panel = panels.find((p) => p.dataset["tabPanel"] === id);
    if (panel) {
      if (!panel.id) panel.id = `tab-panel-${id}`;
      if (!t.id) t.id = `tab-trigger-${id}`;
      t.setAttribute("aria-controls", panel.id);
      panel.setAttribute("aria-labelledby", t.id);
    }
  });

  panels.forEach((p) => {
    p.setAttribute("role", "tabpanel");
  });

  function activate(tabId: string) {
    triggers.forEach((t) => {
      const isActive = t.dataset["tabTrigger"] === tabId;
      t.classList.toggle("is-active", isActive);
      t.setAttribute("aria-selected", String(isActive));
      t.setAttribute("tabindex", isActive ? "0" : "-1");
    });
    panels.forEach((p) => {
      const isActive = p.dataset["tabPanel"] === tabId;
      p.classList.toggle("is-active", isActive);
      p.toggleAttribute("hidden", !isActive);
      p.setAttribute("aria-hidden", String(!isActive));
      p.setAttribute("tabindex", isActive ? "0" : "-1");
    });
    onChange?.(tabId);
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const id = trigger.dataset["tabTrigger"];
      if (id) activate(id);
    });

    // Arrow key navigation within the tablist
    trigger.addEventListener("keydown", (e) => {
      const idx = triggers.indexOf(trigger);
      let next: HTMLElement | undefined;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        next = triggers[(idx + 1) % triggers.length];
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        next = triggers[(idx - 1 + triggers.length) % triggers.length];
      } else if (e.key === "Home") {
        next = triggers[0];
      } else if (e.key === "End") {
        next = triggers[triggers.length - 1];
      }

      if (next) {
        e.preventDefault();
        const id = next.dataset["tabTrigger"];
        if (id) activate(id);
        next.focus();
      }
    });
  });

  // Activate whichever trigger already has is-active, or the first one
  const initial =
    triggers.find((t) => t.classList.contains("is-active"))?.dataset["tabTrigger"] ??
    triggers[0]?.dataset["tabTrigger"];

  if (initial) activate(initial);

  return { activate };
}
