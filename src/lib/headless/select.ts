export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
  group?: string;
  disabled: boolean;
}

export interface SelectOptions {
  el: HTMLElement;
  onChange?: (value: string) => void;
}

export interface SelectHandle {
  getValue(): string;
  setValue(value: string): void;
  open(): void;
  close(): void;
  destroy(): void;
}

interface RenderedOption {
  data: SelectOption;
  button: HTMLButtonElement;
}

let selectId = 0;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseOptions(select: HTMLSelectElement): SelectOption[] {
  return Array.from(select.options).map((option) => ({
    value: option.value,
    label: option.textContent?.trim() ?? option.value,
    icon: option.dataset["icon"],
    group: option.parentElement instanceof HTMLOptGroupElement ? option.parentElement.label : undefined,
    disabled: option.disabled,
  }));
}

function optionMarkup(option: SelectOption): string {
  const icon = option.icon
    ? `<span class="custom-select-option-icon" aria-hidden="true"><i data-lucide="${escapeHtml(option.icon)}"></i></span>`
    : "";

  return `${icon}<span>${escapeHtml(option.label)}</span>`;
}

export function bindSelect(options: SelectOptions): SelectHandle {
  const { el, onChange } = options;
  const nativeSelect = el.querySelector<HTMLSelectElement>(".custom-select-native");
  const trigger = el.querySelector<HTMLButtonElement>(".custom-select-trigger");
  const list = el.querySelector<HTMLElement>(".custom-select-list");
  const search = el.querySelector<HTMLInputElement>(".custom-select-search");

  if (!nativeSelect || !trigger || !list) {
    throw new Error("bindSelect: expected native select, trigger, and list elements");
  }

  const selectEl = nativeSelect;
  const triggerEl = trigger;
  const listEl = list;

  const instanceId = `custom-select-${++selectId}`;
  let renderedOptions: RenderedOption[] = [];
  let visibleOptions: RenderedOption[] = [];
  let activeIndex = -1;
  let typeahead = "";
  let typeaheadTimer = 0;

  listEl.id = listEl.id || `${instanceId}-listbox`;
  listEl.setAttribute("role", "listbox");
  listEl.hidden = true;
  listEl.setAttribute("aria-hidden", "true");
  triggerEl.setAttribute("aria-haspopup", "listbox");
  triggerEl.setAttribute("aria-controls", listEl.id);
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

  if (search && !search.hasAttribute("aria-label")) {
    search.setAttribute("aria-label", "Filter options");
  }

  function getOptions(): SelectOption[] {
    return parseOptions(selectEl);
  }

  function getSelectedOption(): SelectOption | undefined {
    return getOptions().find((option) => option.value === selectEl.value) ?? getOptions()[0];
  }

  function syncTrigger() {
    const selected = getSelectedOption();
    triggerEl.innerHTML = selected ? optionMarkup(selected) : '<span>Select an option</span>';
    triggerEl.setAttribute("aria-expanded", String(el.classList.contains("is-open")));
    triggerEl.disabled = selectEl.disabled;
  }

  function syncOptionState() {
    renderedOptions.forEach(({ data, button }, index) => {
      const isSelected = data.value === selectEl.value;
      const isActive = index === activeIndex && !button.hidden && !button.disabled;
      button.classList.toggle("is-selected", isSelected);
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isSelected));
    });

    const active = visibleOptions[activeIndex];
    if (active) {
      listEl.setAttribute("aria-activedescendant", active.button.id);
    } else {
      listEl.removeAttribute("aria-activedescendant");
    }
  }

  function syncVisibleOptions() {
    visibleOptions = renderedOptions.filter(({ button }) => !button.hidden && !button.disabled);

    if (visibleOptions.length === 0) {
      activeIndex = -1;
      syncOptionState();
      return;
    }

    const selectedIndex = visibleOptions.findIndex(({ data }) => data.value === selectEl.value);
    if (selectedIndex >= 0) {
      activeIndex = selectedIndex;
    } else if (activeIndex < 0 || activeIndex >= visibleOptions.length) {
      activeIndex = 0;
    }

    syncOptionState();
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

  function renderOptions() {
    const optionsData = getOptions();
    const existingSearch = search;
    const fragment = document.createDocumentFragment();
    const groups = new Map<string, HTMLElement>();
    renderedOptions = [];

    if (existingSearch) {
      fragment.appendChild(existingSearch);
    }

    optionsData.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "custom-select-option";
      button.id = `${instanceId}-option-${index}`;
      button.dataset["value"] = option.value;
      button.dataset["label"] = option.label.toLowerCase();
      button.dataset["group"] = option.group?.toLowerCase() ?? "";
      button.innerHTML = optionMarkup(option);
      button.setAttribute("role", "option");
      button.disabled = option.disabled;

      const rendered: RenderedOption = { data: option, button };
      renderedOptions.push(rendered);

      button.addEventListener("click", () => {
        if (button.disabled) return;
        selectEl.value = option.value;
        syncTrigger();
        syncVisibleOptions();
        close();
        onChange?.(option.value);
      });

      if (option.group) {
        let groupEl = groups.get(option.group);
        if (!groupEl) {
          groupEl = document.createElement("div");
          groupEl.className = "custom-select-group";

          const label = document.createElement("div");
          label.className = "custom-select-group-label";
          label.textContent = option.group;
          groupEl.appendChild(label);
          groups.set(option.group, groupEl);
          fragment.appendChild(groupEl);
        }
        groupEl.appendChild(button);
      } else {
        fragment.appendChild(button);
      }
    });

    listEl.replaceChildren(fragment);
    syncVisibleOptions();
  }

  function filterOptions(query: string) {
    const term = query.trim().toLowerCase();

    renderedOptions.forEach(({ button }) => {
      const label = button.dataset["label"] ?? "";
      const group = button.dataset["group"] ?? "";
      const matches = term === "" || label.includes(term) || group.includes(term);
      button.hidden = !matches;
    });

    listEl.querySelectorAll<HTMLElement>(".custom-select-group").forEach((group) => {
      const hasVisibleOption = Array.from(group.querySelectorAll<HTMLButtonElement>(".custom-select-option")).some(
        (button) => !button.hidden,
      );
      group.hidden = !hasVisibleOption;
    });

    syncVisibleOptions();
  }

  function open() {
    if (selectEl.disabled) return;
    el.classList.add("is-open");
    listEl.hidden = false;
    listEl.setAttribute("aria-hidden", "false");
    syncTrigger();
    syncVisibleOptions();
    requestAnimationFrame(() => {
      if (search) {
        search.focus();
        search.select();
      } else {
        focusActiveOption();
      }
    });
  }

  function close() {
    el.classList.remove("is-open");
    triggerEl.setAttribute("aria-expanded", "false");
    listEl.removeAttribute("aria-activedescendant");
    listEl.setAttribute("aria-hidden", "true");
    listEl.hidden = true;
    if (search) {
      search.value = "";
      filterOptions("");
    }
  }

  function commitActiveOption() {
    const active = visibleOptions[activeIndex];
    if (!active) return;
    selectEl.value = active.data.value;
    syncTrigger();
    syncVisibleOptions();
    close();
    triggerEl.focus();
    onChange?.(active.data.value);
  }

  function moveActive(delta: number) {
    if (!el.classList.contains("is-open")) {
      open();
    }

    if (visibleOptions.length === 0) return;
    const start = activeIndex < 0 ? 0 : activeIndex;
    setActiveIndex(start + delta);
  }

  function handleTypeahead(key: string) {
    typeahead += key.toLowerCase();
    window.clearTimeout(typeaheadTimer);
    typeaheadTimer = window.setTimeout(() => {
      typeahead = "";
    }, 350);

    const matchIndex = visibleOptions.findIndex(({ data }) => data.label.toLowerCase().startsWith(typeahead));
    if (matchIndex >= 0) {
      setActiveIndex(matchIndex);
    }
  }

  const onTriggerClick = () => {
    if (el.classList.contains("is-open")) {
      close();
      return;
    }
    open();
  };

  const onTriggerKeydown = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      open();
      setActiveIndex(Math.max(activeIndex, 0));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      open();
      setActiveIndex(activeIndex > 0 ? activeIndex - 1 : Math.max(visibleOptions.length - 1, 0));
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onTriggerClick();
      return;
    }

    if (event.key.length === 1 && /\S/.test(event.key)) {
      if (!el.classList.contains("is-open")) open();
      handleTypeahead(event.key);
    }
  };

  const onListKeydown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveActive(1);
        return;
      case "ArrowUp":
        event.preventDefault();
        moveActive(-1);
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
        event.preventDefault();
        commitActiveOption();
        return;
      case "Escape":
        event.preventDefault();
        close();
        triggerEl.focus();
        return;
      case "Tab":
        close();
        return;
      default:
        if (event.key.length === 1 && /\S/.test(event.key) && !event.ctrlKey && !event.metaKey) {
          handleTypeahead(event.key);
        }
    }
  };

  const onDocumentPointerDown = (event: MouseEvent) => {
    const target = event.target;
    if (target instanceof Node && !el.contains(target)) {
      close();
    }
  };

  const onNativeChange = () => {
    syncTrigger();
    syncVisibleOptions();
  };

  triggerEl.addEventListener("click", onTriggerClick);
  triggerEl.addEventListener("keydown", onTriggerKeydown);
  listEl.addEventListener("keydown", onListKeydown);
  document.addEventListener("mousedown", onDocumentPointerDown);
  selectEl.addEventListener("change", onNativeChange);

  search?.addEventListener("input", () => filterOptions(search.value));
  search?.addEventListener("keydown", onListKeydown);

  renderOptions();
  syncTrigger();

  return {
    getValue() {
      return selectEl.value;
    },
    setValue(value: string) {
      const hasOption = Array.from(selectEl.options).some((option) => option.value === value);
      if (!hasOption) return;
      selectEl.value = value;
      syncTrigger();
      syncVisibleOptions();
    },
    open,
    close,
    destroy() {
      window.clearTimeout(typeaheadTimer);
      triggerEl.removeEventListener("click", onTriggerClick);
      triggerEl.removeEventListener("keydown", onTriggerKeydown);
      listEl.removeEventListener("keydown", onListKeydown);
      document.removeEventListener("mousedown", onDocumentPointerDown);
      selectEl.removeEventListener("change", onNativeChange);
      search?.removeEventListener("keydown", onListKeydown);
      el.classList.remove("is-enhanced", "is-open");
      triggerEl.removeAttribute("aria-controls");
      triggerEl.removeAttribute("aria-expanded");
      triggerEl.removeAttribute("aria-label");
      triggerEl.removeAttribute("aria-labelledby");
      listEl.removeAttribute("aria-activedescendant");
      listEl.removeAttribute("aria-hidden");
      listEl.removeAttribute("role");
      listEl.hidden = false;
    },
  };
}
