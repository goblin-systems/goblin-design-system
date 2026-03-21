export interface NavigationOptions {
  /** Scope queries to this element. Defaults to document. */
  root?: ParentNode;
  /** Called when a nav option is activated (clicked). */
  onSelect?: (id: string) => void;
}

export interface NavigationHandle {
  openItem: (item: HTMLElement) => void;
  closeItem: (item: HTMLElement) => void;
  closeAll: () => void;
}

/**
 * Bind interactive behaviour to a `.nav-bar` element.
 *
 * Expected markup structure:
 *
 *   <nav class="nav-bar">
 *     <div class="nav-item">
 *       <button class="nav-trigger">File <i data-lucide="chevron-down"></i></button>
 *       <div class="nav-dropdown">
 *         <button class="nav-option" data-nav-id="new">New</button>
 *         <div class="nav-divider"></div>
 *         <div class="nav-option nav-option--has-sub">
 *           Export <i class="nav-option-arrow" data-lucide="chevron-right"></i>
 *           <div class="nav-submenu">
 *             <button class="nav-option" data-nav-id="export-png">PNG</button>
 *           </div>
 *         </div>
 *       </div>
 *     </div>
 *   </nav>
 */
export function bindNavigation(options: NavigationOptions = {}): NavigationHandle {
  const { root = document, onSelect } = options;

  const items = Array.from(root.querySelectorAll<HTMLElement>(".nav-item"));
  let activeItem: HTMLElement | null = null;

  function openItem(item: HTMLElement) {
    if (activeItem && activeItem !== item) closeItem(activeItem);
    const trigger = item.querySelector<HTMLElement>(".nav-trigger");
    const dropdown = item.querySelector<HTMLElement>(".nav-dropdown");
    if (!trigger || !dropdown) return;
    trigger.classList.add("is-open");
    dropdown.classList.add("is-open");
    activeItem = item;
  }

  function closeItem(item: HTMLElement) {
    item.querySelector<HTMLElement>(".nav-trigger")?.classList.remove("is-open");
    const dropdown = item.querySelector<HTMLElement>(".nav-dropdown");
    dropdown?.classList.remove("is-open");
    dropdown
      ?.querySelectorAll<HTMLElement>(".nav-option--has-sub.is-sub-open")
      .forEach((el) => el.classList.remove("is-sub-open"));
    if (activeItem === item) activeItem = null;
  }

  function closeAll() {
    items.forEach(closeItem);
  }

  items.forEach((item) => {
    const trigger = item.querySelector<HTMLElement>(".nav-trigger");
    const dropdown = item.querySelector<HTMLElement>(".nav-dropdown");

    trigger?.addEventListener("click", (e) => {
      e.stopPropagation();
      activeItem === item ? closeItem(item) : openItem(item);
    });

    // When any menu is open and user hovers another trigger, switch immediately
    trigger?.addEventListener("mouseenter", () => {
      if (activeItem && activeItem !== item) openItem(item);
    });

    // Submenu open/close on hover
    dropdown?.querySelectorAll<HTMLElement>(".nav-option--has-sub").forEach((opt) => {
      opt.addEventListener("mouseenter", () => {
        dropdown
          .querySelectorAll<HTMLElement>(".nav-option--has-sub.is-sub-open")
          .forEach((el) => {
            if (el !== opt) el.classList.remove("is-sub-open");
          });
        opt.classList.add("is-sub-open");
      });

      // Keep submenu open while moving diagonally into it
      const submenu = opt.querySelector<HTMLElement>(".nav-submenu");
      submenu?.addEventListener("mouseleave", (e) => {
        const target = e.relatedTarget as Node | null;
        if (!opt.contains(target)) opt.classList.remove("is-sub-open");
      });
    });

    // Leaf option clicks
    dropdown?.querySelectorAll<HTMLElement>(".nav-option:not(.nav-option--has-sub)").forEach((opt) => {
      opt.addEventListener("click", (e) => {
        e.stopPropagation();
        if (opt.classList.contains("nav-option--disabled")) return;
        const id = opt.dataset["navId"] ?? "";
        onSelect?.(id);
        closeAll();
      });
    });
  });

  // Close on outside click
  document.addEventListener("click", closeAll);

  // Keyboard: Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && activeItem) {
      e.preventDefault();
      closeAll();
    }
  });

  return { openItem, closeItem, closeAll };
}
