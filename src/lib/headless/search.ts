// ── Types ─────────────────────────────────────────────────────────────────────

export interface SearchOptions {
  /** The text input element to attach behaviour to. */
  input: HTMLInputElement;
  /**
   * Called (debounced) whenever the query changes.
   * Use this to fetch/compute suggestions, then call handle.setSuggestions().
   */
  onSearch?: (query: string) => void;
  /**
   * Called when the user selects a suggestion (click or keyboard Enter).
   * The input value is already set to the selected string before this fires.
   */
  onSelect?: (value: string) => void;
  /** Debounce delay in ms before onSearch fires. Default 200. */
  debounce?: number;
  /** Minimum characters before onSearch fires. Default 0. */
  minChars?: number;
}

export interface SearchHandle {
  setSuggestions(items: string[]): void;
  clearSuggestions(): void;
  destroy(): void;
}

// ── Implementation ────────────────────────────────────────────────────────────

let _idCounter = 0;

export function bindSearch(options: SearchOptions): SearchHandle {
  const {
    input,
    onSearch,
    onSelect,
    debounce: debounceMs = 200,
    minChars = 0,
  } = options;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let activeIndex = -1;
  let suggestions: string[] = [];
  let liveRegion: HTMLElement | null = null;

  const dropdown = input
    .closest(".search-field")
    ?.querySelector<HTMLElement>(".search-suggestions") ?? null;

  // ── ARIA setup ─────────────────────────────────────────────────────────────
  const uid = ++_idCounter;
  const listId = `search-list-${uid}`;

  input.setAttribute("role", "combobox");
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-expanded", "false");
  input.setAttribute("aria-haspopup", "listbox");

  if (dropdown) {
    dropdown.setAttribute("role", "listbox");
    dropdown.id = dropdown.id || listId;
    input.setAttribute("aria-controls", dropdown.id);
  }

  const field = input.closest(".search-field");
  if (field) {
    liveRegion = field.querySelector<HTMLElement>(".search-announcer");
    if (!liveRegion) {
      liveRegion = document.createElement("div");
      liveRegion.className = "search-announcer sr-only";
      liveRegion.setAttribute("aria-live", "polite");
      field.appendChild(liveRegion);
    }
  }

  // ── Rendering ──────────────────────────────────────────────────────────────

  function render(items: string[]) {
    suggestions = items;
    activeIndex = -1;
    if (!dropdown) return;

    dropdown.innerHTML = "";
    input.removeAttribute("aria-activedescendant");

    if (items.length === 0) {
      dropdown.classList.remove("is-open");
      input.setAttribute("aria-expanded", "false");
      return;
    }

    const frag = document.createDocumentFragment();
    items.forEach((item, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "search-suggestion";
      btn.textContent = item;
      btn.id = `search-option-${uid}-${i}`;
      btn.setAttribute("role", "option");
      btn.setAttribute("aria-selected", "false");
      btn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        select(item);
      });
      frag.appendChild(btn);
    });
    dropdown.appendChild(frag);
    dropdown.classList.add("is-open");
    input.setAttribute("aria-expanded", "true");
    if (liveRegion) liveRegion.textContent = `Combobox expanded, ${items.length} result${items.length === 1 ? "" : "s"}`;
  }

  function select(value: string) {
    input.value = value;
    dropdown?.classList.remove("is-open");
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    suggestions = [];
    activeIndex = -1;
    onSelect?.(value);
    if (liveRegion) liveRegion.textContent = `${value} selected`;
  }

  function setActive(index: number) {
    if (!dropdown) return;
    const els = dropdown.querySelectorAll<HTMLElement>(".search-suggestion");
    els.forEach((el, i) => {
      const active = i === index;
      el.classList.toggle("is-active", active);
      el.setAttribute("aria-selected", String(active));
    });
    activeIndex = index;
    if (index >= 0 && els[index]) {
      input.setAttribute("aria-activedescendant", els[index].id);
      els[index].scrollIntoView({ block: "nearest" });
      if (liveRegion) liveRegion.textContent = `${els[index].textContent ?? ""}, ${index + 1} of ${els.length}`;
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  function onInput() {
    if (timer) clearTimeout(timer);
    const q = input.value;
    if (q.length < minChars) { render([]); return; }
    timer = setTimeout(() => onSearch?.(q), debounceMs);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!dropdown?.classList.contains("is-open")) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive(Math.min(activeIndex + 1, suggestions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive(Math.max(activeIndex - 1, 0));
        break;
      case "Enter":
        if (activeIndex >= 0) { e.preventDefault(); select(suggestions[activeIndex]); }
        break;
      case "Escape":
        render([]);
        break;
    }
  }

  function onBlur() {
    setTimeout(() => {
      dropdown?.classList.remove("is-open");
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
    }, 150);
  }

  input.addEventListener("input", onInput);
  input.addEventListener("keydown", onKeyDown);
  input.addEventListener("blur", onBlur);

  return {
    setSuggestions: render,
    clearSuggestions: () => render([]),
    destroy() {
      if (timer) clearTimeout(timer);
      input.removeEventListener("input", onInput);
      input.removeEventListener("keydown", onKeyDown);
      input.removeEventListener("blur", onBlur);
    },
  };
}
