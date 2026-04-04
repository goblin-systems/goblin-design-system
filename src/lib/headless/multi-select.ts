export interface MultiSelectOption {
  value: string;
  label: string;
  icon?: string;
  group?: string;
}

export interface MultiSelectOptions {
  el: HTMLElement;
  placeholder?: string;
  onChange?: (values: string[]) => void;
}

export interface MultiSelectHandle {
  getValues(): string[];
  setValues(values: string[]): void;
  open(): void;
  close(): void;
  destroy(): void;
}

interface RenderedOption {
  data: MultiSelectOption;
  button: HTMLButtonElement;
}

let multiSelectId = 0;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseOptions(select: HTMLSelectElement): MultiSelectOption[] {
  return Array.from(select.options).map((option) => ({
    value: option.value,
    label: option.textContent?.trim() ?? option.value,
    icon: option.dataset["icon"],
    group: option.parentElement instanceof HTMLOptGroupElement ? option.parentElement.label : undefined,
  }));
}

export function bindMultiSelect(options: MultiSelectOptions): MultiSelectHandle {
  const { el, placeholder = "Select options", onChange } = options;

  const nativeSelect = el.querySelector<HTMLSelectElement>(".custom-select-native");
  const trigger = el.querySelector<HTMLElement>(".custom-select-trigger");
  const list = el.querySelector<HTMLElement>(".custom-select-list");

  if (!nativeSelect || !trigger || !list) {
    throw new Error("bindMultiSelect: expected native select, trigger, and list elements");
  }

  const selectEl = nativeSelect;
  const triggerEl = trigger;
  const listEl = list;

  const instanceId = `multi-select-${++multiSelectId}`;
  let renderedOptions: RenderedOption[] = [];
  let visibleOptions: RenderedOption[] = [];
  let activeIndex = -1;

  // --- ARIA / accessibility setup ---
  listEl.id = listEl.id || `${instanceId}-listbox`;
  listEl.setAttribute("role", "listbox");
  listEl.setAttribute("aria-multiselectable", "true");
  listEl.hidden = true;
  listEl.setAttribute("aria-hidden", "true");

  triggerEl.setAttribute("role", "combobox");
  triggerEl.setAttribute("aria-haspopup", "listbox");
  triggerEl.setAttribute("aria-controls", listEl.id);
  triggerEl.setAttribute("aria-expanded", "false");
  triggerEl.setAttribute("tabindex", "0");

  selectEl.tabIndex = -1;
  el.classList.add("is-enhanced");

  const labelledBy = selectEl.getAttribute("aria-labelledby");
  const ariaLabel = selectEl.getAttribute("aria-label");
  const label = selectEl.labels?.[0];

  if (labelledBy) {
    triggerEl.setAttribute("aria-labelledby", labelledBy);
  } else if (ariaLabel) {
    triggerEl.setAttribute("aria-label", ariaLabel);
  } else if (label) {
    if (!label.id) {
      label.id = `${instanceId}-label`;
    }
    triggerEl.setAttribute("aria-labelledby", label.id);
  }

  // --- Selection state helpers ---

  function getSelectedValues(): string[] {
    return Array.from(selectEl.options)
      .filter((o) => o.selected)
      .map((o) => o.value);
  }

  function setNativeSelection(values: string[]) {
    Array.from(selectEl.options).forEach((o) => {
      o.selected = values.includes(o.value);
    });
  }

  function toggleValue(value: string) {
    const option = Array.from(selectEl.options).find((o) => o.value === value);
    if (!option || option.disabled) return;
    option.selected = !option.selected;
  }

  // --- Trigger rendering ---

  function syncTrigger() {
    const values = getSelectedValues();
    const isOpen = el.classList.contains("is-open");
    triggerEl.setAttribute("aria-expanded", String(isOpen));

    // Build chips container
    const chipsEl = document.createElement("div");
    chipsEl.className = "multi-select-chips";

    if (values.length === 0) {
      const placeholderEl = document.createElement("span");
      placeholderEl.className = "multi-select-placeholder";
      placeholderEl.textContent = placeholder;
      triggerEl.replaceChildren(placeholderEl);
      return;
    }

    const opts = parseOptions(selectEl);
    values.forEach((val) => {
      const opt = opts.find((o) => o.value === val);
      if (!opt) return;

      const chip = document.createElement("span");
      chip.className = "multi-select-chip";
      chip.dataset["value"] = val;

      const chipLabel = document.createElement("span");
      chipLabel.textContent = opt.label;
      chip.appendChild(chipLabel);

      const chipRemove = document.createElement("button");
      chipRemove.type = "button";
      chipRemove.className = "multi-select-chip-remove";
      chipRemove.setAttribute("aria-label", `Remove ${opt.label}`);
      chipRemove.innerHTML = `<span aria-hidden="true">&times;</span>`;
      chipRemove.addEventListener("mousedown", (event) => {
        // Prevent trigger's click (which toggles open) from firing
        event.stopPropagation();
        event.preventDefault();
        toggleValue(val);
        syncTrigger();
        syncOptionState();
        onChange?.(getSelectedValues());
      });

      chip.appendChild(chipRemove);
      chipsEl.appendChild(chip);
    });

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "multi-select-clear";
    clearBtn.setAttribute("aria-label", "Clear all");
    clearBtn.innerHTML = `<span aria-hidden="true">&times;</span>`;
    clearBtn.addEventListener("mousedown", (event) => {
      event.stopPropagation();
      event.preventDefault();
      setNativeSelection([]);
      syncTrigger();
      syncOptionState();
      onChange?.([]);
    });

    triggerEl.replaceChildren(chipsEl, clearBtn);
  }

  // --- Option state ---

  function syncOptionState() {
    const values = getSelectedValues();

    renderedOptions.forEach(({ data, button }, index) => {
      const isSelected = values.includes(data.value);
      const isActive = index === activeIndex && !button.hidden && !button.disabled;
      button.classList.toggle("is-selected", isSelected);
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isSelected));

      // Update the check indicator visibility
      const check = button.querySelector<HTMLElement>(".custom-select-option-check");
      if (check) {
        check.setAttribute("aria-hidden", "true");
        check.style.visibility = isSelected ? "visible" : "hidden";
      }
    });

    visibleOptions = renderedOptions.filter(({ button }) => !button.hidden && !button.disabled);

    const active = visibleOptions[activeIndex];
    if (active) {
      listEl.setAttribute("aria-activedescendant", active.button.id);
    } else {
      listEl.removeAttribute("aria-activedescendant");
    }
  }

  function focusActiveOption() {
    const active = visibleOptions[activeIndex];
    active?.button.scrollIntoView({ block: "nearest" });
  }

  function setActiveIndex(nextIndex: number) {
    if (visibleOptions.length === 0) {
      activeIndex = -1;
      syncOptionState();
      return;
    }
    activeIndex = Math.max(0, Math.min(nextIndex, visibleOptions.length - 1));
    syncOptionState();
    focusActiveOption();
  }

  // --- Render option list ---

  function renderOptions() {
    const optionsData = parseOptions(selectEl);
    const fragment = document.createDocumentFragment();
    const groups = new Map<string, HTMLElement>();
    renderedOptions = [];

    optionsData.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "custom-select-option";
      button.id = `${instanceId}-option-${index}`;
      button.dataset["value"] = option.value;
      button.dataset["label"] = option.label.toLowerCase();
      button.dataset["group"] = option.group?.toLowerCase() ?? "";
      button.setAttribute("role", "option");

      // Find disabled state from the native option directly
      const nativeOption = Array.from(selectEl.options).find((o) => o.value === option.value);
      button.disabled = nativeOption?.disabled ?? false;

      // Check indicator — always first child
      const checkSpan = document.createElement("span");
      checkSpan.className = "custom-select-option-check";
      checkSpan.setAttribute("aria-hidden", "true");
      button.appendChild(checkSpan);

      if (option.icon) {
        const iconSpan = document.createElement("span");
        iconSpan.className = "custom-select-option-icon";
        iconSpan.setAttribute("aria-hidden", "true");
        iconSpan.innerHTML = `<i data-lucide="${escapeHtml(option.icon)}"></i>`;
        button.appendChild(iconSpan);
      }

      const labelSpan = document.createElement("span");
      labelSpan.textContent = option.label;
      button.appendChild(labelSpan);

      const rendered: RenderedOption = { data: option, button };
      renderedOptions.push(rendered);

      button.addEventListener("click", () => {
        if (button.disabled) return;
        toggleValue(option.value);
        syncTrigger();
        syncOptionState();
        onChange?.(getSelectedValues());
        // do NOT close — multi-select stays open on toggle
      });

      if (option.group) {
        let groupEl = groups.get(option.group);
        if (!groupEl) {
          groupEl = document.createElement("div");
          groupEl.className = "custom-select-group";

          const groupLabel = document.createElement("div");
          groupLabel.className = "custom-select-group-label";
          groupLabel.textContent = option.group;
          groupEl.appendChild(groupLabel);
          groups.set(option.group, groupEl);
          fragment.appendChild(groupEl);
        }
        groupEl.appendChild(button);
      } else {
        fragment.appendChild(button);
      }
    });

    listEl.replaceChildren(fragment);
    visibleOptions = renderedOptions.filter(({ button }) => !button.hidden && !button.disabled);
    syncOptionState();
  }

  // --- Open / close ---

  function open() {
    if (selectEl.disabled) return;
    el.classList.add("is-open");
    listEl.hidden = false;
    listEl.setAttribute("aria-hidden", "false");
    triggerEl.setAttribute("aria-expanded", "true");
    syncOptionState();

    // Focus the first selected option, or the first option
    const values = getSelectedValues();
    const firstSelectedIndex = visibleOptions.findIndex(({ data }) => values.includes(data.value));
    activeIndex = firstSelectedIndex >= 0 ? firstSelectedIndex : 0;
    syncOptionState();
    requestAnimationFrame(() => {
      focusActiveOption();
    });
  }

  function close() {
    el.classList.remove("is-open");
    listEl.hidden = true;
    listEl.setAttribute("aria-hidden", "true");
    listEl.removeAttribute("aria-activedescendant");
    triggerEl.setAttribute("aria-expanded", "false");
  }

  // --- Event handlers ---

  const onTriggerClick = () => {
    if (el.classList.contains("is-open")) {
      close();
      return;
    }
    open();
  };

  const onTriggerKeydown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!el.classList.contains("is-open")) {
          open();
        } else {
          setActiveIndex(Math.max(activeIndex, 0));
        }
        return;
      case "ArrowUp":
        event.preventDefault();
        if (!el.classList.contains("is-open")) {
          open();
        } else {
          setActiveIndex(activeIndex > 0 ? activeIndex - 1 : Math.max(visibleOptions.length - 1, 0));
        }
        return;
      case "Enter":
      case " ":
        event.preventDefault();
        if (el.classList.contains("is-open")) {
          // Toggle the active option
          const active = visibleOptions[activeIndex];
          if (active) {
            toggleValue(active.data.value);
            syncTrigger();
            syncOptionState();
            onChange?.(getSelectedValues());
          }
        } else {
          open();
        }
        return;
      case "Escape":
        event.preventDefault();
        close();
        return;
      case "Tab":
        close();
        return;
    }
  };

  const onListKeydown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex(activeIndex < 0 ? 0 : activeIndex + 1);
        return;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex(activeIndex > 0 ? activeIndex - 1 : 0);
        return;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        return;
      case "End":
        event.preventDefault();
        setActiveIndex(visibleOptions.length - 1);
        return;
      case "Enter":
      case " ": {
        event.preventDefault();
        const active = visibleOptions[activeIndex];
        if (active) {
          toggleValue(active.data.value);
          syncTrigger();
          syncOptionState();
          onChange?.(getSelectedValues());
        }
        return;
      }
      case "Escape":
        event.preventDefault();
        close();
        triggerEl.focus();
        return;
      case "Tab":
        close();
        return;
    }
  };

  const onDocumentMousedown = (event: MouseEvent) => {
    const target = event.target;
    if (target instanceof Node && !el.contains(target)) {
      close();
    }
  };

  const onNativeChange = () => {
    syncTrigger();
    syncOptionState();
  };

  triggerEl.addEventListener("click", onTriggerClick);
  triggerEl.addEventListener("keydown", onTriggerKeydown);
  listEl.addEventListener("keydown", onListKeydown);
  document.addEventListener("mousedown", onDocumentMousedown);
  selectEl.addEventListener("change", onNativeChange);

  renderOptions();
  syncTrigger();

  return {
    getValues() {
      return getSelectedValues();
    },
    setValues(values: string[]) {
      const available = new Set(Array.from(selectEl.options).map((o) => o.value));
      setNativeSelection(values.filter((v) => available.has(v)));
      syncTrigger();
      syncOptionState();
    },
    open,
    close,
    destroy() {
      triggerEl.removeEventListener("click", onTriggerClick);
      triggerEl.removeEventListener("keydown", onTriggerKeydown);
      listEl.removeEventListener("keydown", onListKeydown);
      document.removeEventListener("mousedown", onDocumentMousedown);
      selectEl.removeEventListener("change", onNativeChange);

      el.classList.remove("is-enhanced", "is-open");
      triggerEl.removeAttribute("role");
      triggerEl.removeAttribute("aria-haspopup");
      triggerEl.removeAttribute("aria-controls");
      triggerEl.removeAttribute("aria-expanded");
      triggerEl.removeAttribute("aria-label");
      triggerEl.removeAttribute("aria-labelledby");
      triggerEl.removeAttribute("tabindex");
      listEl.removeAttribute("aria-activedescendant");
      listEl.removeAttribute("aria-hidden");
      listEl.removeAttribute("aria-multiselectable");
      listEl.removeAttribute("role");
      listEl.hidden = false;
      selectEl.tabIndex = 0;
    },
  };
}
