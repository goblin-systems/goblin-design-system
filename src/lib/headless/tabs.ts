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

  function activate(tabId: string) {
    triggers.forEach((t) => {
      t.classList.toggle("is-active", t.dataset["tabTrigger"] === tabId);
    });
    panels.forEach((p) => {
      p.classList.toggle("is-active", p.dataset["tabPanel"] === tabId);
    });
    onChange?.(tabId);
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const id = trigger.dataset["tabTrigger"];
      if (id) activate(id);
    });
  });

  // Activate whichever trigger already has is-active, or the first one
  const initial =
    triggers.find((t) => t.classList.contains("is-active"))?.dataset["tabTrigger"] ??
    triggers[0]?.dataset["tabTrigger"];

  if (initial) activate(initial);

  return { activate };
}
