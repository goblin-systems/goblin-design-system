export interface ToggleGroupOptions {
  /** The `.btn-group` container element. */
  el: HTMLElement;
  /** Allow multiple buttons active simultaneously. Default false (single-select). */
  multiple?: boolean;
  /** Initial active values (matched against button's data-value or textContent). */
  value?: string[];
  /** Called when selection changes. */
  onChange?: (selected: string[]) => void;
}

export interface ToggleGroupHandle {
  getSelected(): string[];
  setSelected(values: string[]): void;
  destroy(): void;
}

export function bindToggleGroup(options: ToggleGroupOptions): ToggleGroupHandle {
  const { el, multiple = false, onChange } = options;

  const buttons = Array.from(el.querySelectorAll<HTMLButtonElement>("button"));

  function getValue(btn: HTMLButtonElement): string {
    return btn.dataset["value"] ?? btn.textContent?.trim() ?? "";
  }

  function getSelected(): string[] {
    return buttons.filter((b) => b.classList.contains("is-active")).map(getValue);
  }

  function applySelection(values: string[]) {
    buttons.forEach((btn) => {
      const active = values.includes(getValue(btn));
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  }

  function setSelected(values: string[]) {
    applySelection(multiple ? values : values.slice(0, 1));
  }

  const handlers = new Map<HTMLButtonElement, () => void>();

  buttons.forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.classList.contains("is-active")));

    const handler = () => {
      const val = getValue(btn);
      if (multiple) {
        const current = getSelected();
        const next = current.includes(val)
          ? current.filter((v) => v !== val)
          : [...current, val];
        applySelection(next);
      } else {
        applySelection([val]);
      }
      onChange?.(getSelected());
    };

    handlers.set(btn, handler);
    btn.addEventListener("click", handler);
  });

  // Apply initial value
  if (options.value) applySelection(options.value);

  return {
    getSelected,
    setSelected,
    destroy() {
      buttons.forEach((btn) => {
        const h = handlers.get(btn);
        if (h) btn.removeEventListener("click", h);
      });
      handlers.clear();
    },
  };
}
