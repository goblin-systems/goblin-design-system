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
  /**
   * Populate the suggestions dropdown.
   * Pass an empty array to hide the dropdown.
   * Call this from your onSearch callback once your data is ready.
   */
  setSuggestions(items: string[]): void;
  /** Clear suggestions and hide the dropdown. */
  clearSuggestions(): void;
  /** Remove all event listeners. */
  destroy(): void;
}

// ── Implementation ────────────────────────────────────────────────────────────

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

  // Suggestions dropdown: must be a sibling .search-suggestions inside the
  // same .search-field wrapper (created by the consumer in their markup).
  const dropdown = input
    .closest(".search-field")
    ?.querySelector<HTMLElement>(".search-suggestions") ?? null;

  // ── Rendering ──────────────────────────────────────────────────────────────

  function render(items: string[]) {
    suggestions = items;
    activeIndex = -1;
    if (!dropdown) return;

    dropdown.innerHTML = "";

    if (items.length === 0) {
      dropdown.classList.remove("is-open");
      return;
    }

    const frag = document.createDocumentFragment();
    for (const item of items) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "search-suggestion";
      btn.textContent = item;
      btn.addEventListener("mousedown", (e) => {
        e.preventDefault(); // keep focus on input
        select(item);
      });
      frag.appendChild(btn);
    }
    dropdown.appendChild(frag);
    dropdown.classList.add("is-open");
  }

  function select(value: string) {
    input.value = value;
    dropdown?.classList.remove("is-open");
    suggestions = [];
    activeIndex = -1;
    onSelect?.(value);
  }

  function setActive(index: number) {
    if (!dropdown) return;
    const els = dropdown.querySelectorAll<HTMLElement>(".search-suggestion");
    els.forEach((el, i) => el.classList.toggle("is-active", i === index));
    activeIndex = index;
    els[index]?.scrollIntoView({ block: "nearest" });
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
    // Allow mousedown on a suggestion to register before hiding
    setTimeout(() => dropdown?.classList.remove("is-open"), 150);
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
