export interface NavigationOptions {
  /** Scope queries to this element. Defaults to document. */
  root?: ParentNode;
  /** Called when a nav option is activated (clicked or keyboard Enter). */
  onSelect?: (id: string) => void;
}

export interface NavigationHandle {
  openItem: (item: HTMLElement) => void;
  closeItem: (item: HTMLElement) => void;
  closeAll: () => void;
}

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
    trigger.setAttribute("aria-expanded", "true");
    dropdown.classList.add("is-open");
    activeItem = item;
  }

  function closeItem(item: HTMLElement) {
    const trigger = item.querySelector<HTMLElement>(".nav-trigger");
    trigger?.classList.remove("is-open");
    trigger?.setAttribute("aria-expanded", "false");
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

  function activateOption(opt: HTMLElement) {
    if (opt.classList.contains("nav-option--disabled")) return;
    const id = opt.dataset["navId"] ?? "";
    onSelect?.(id);
    closeAll();
  }

  function focusableOptions(dropdown: HTMLElement): HTMLElement[] {
    return Array.from(
      dropdown.querySelectorAll<HTMLElement>(
        ".nav-option:not(.nav-option--disabled)"
      )
    );
  }

  items.forEach((item) => {
    const trigger = item.querySelector<HTMLElement>(".nav-trigger");
    const dropdown = item.querySelector<HTMLElement>(".nav-dropdown");

    // ARIA setup
    trigger?.setAttribute("aria-haspopup", "menu");
    trigger?.setAttribute("aria-expanded", "false");
    if (dropdown) {
      dropdown.setAttribute("role", "menu");
      dropdown.querySelectorAll<HTMLElement>(".nav-option:not(.nav-option--has-sub)").forEach((opt) => {
        opt.setAttribute("role", "menuitem");
        if (!opt.hasAttribute("tabindex")) opt.setAttribute("tabindex", "-1");
      });
    }

    trigger?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (activeItem === item) {
        closeItem(item);
      } else {
        openItem(item);
        // Focus first option on open
        requestAnimationFrame(() => {
          if (dropdown) focusableOptions(dropdown)[0]?.focus();
        });
      }
    });

    trigger?.addEventListener("mouseenter", () => {
      if (activeItem && activeItem !== item) {
        openItem(item);
        requestAnimationFrame(() => {
          if (dropdown) focusableOptions(dropdown)[0]?.focus();
        });
      }
    });

    // Arrow-down on trigger opens and focuses first item
    trigger?.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openItem(item);
        requestAnimationFrame(() => {
          if (dropdown) focusableOptions(dropdown)[0]?.focus();
        });
      }
    });

    // Keyboard nav inside dropdown
    dropdown?.addEventListener("keydown", (e) => {
      if (!dropdown.classList.contains("is-open")) return;
      const opts = focusableOptions(dropdown);
      const current = opts.indexOf(document.activeElement as HTMLElement);

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          opts[(current + 1) % opts.length]?.focus();
          break;
        case "ArrowUp":
          e.preventDefault();
          opts[(current - 1 + opts.length) % opts.length]?.focus();
          break;
        case "Home":
          e.preventDefault();
          opts[0]?.focus();
          break;
        case "End":
          e.preventDefault();
          opts[opts.length - 1]?.focus();
          break;
        case "Enter":
        case " ": {
          e.preventDefault();
          const active = document.activeElement as HTMLElement;
          if (active?.classList.contains("nav-option--has-sub")) {
            active.classList.add("is-sub-open");
            active.querySelector<HTMLElement>(".nav-submenu .nav-option:not(.nav-option--disabled)")?.focus();
          } else if (active && opts.includes(active)) {
            activateOption(active);
          }
          break;
        }
        case "ArrowRight": {
          const active = document.activeElement as HTMLElement;
          if (active?.classList.contains("nav-option--has-sub")) {
            e.preventDefault();
            active.classList.add("is-sub-open");
            active.querySelector<HTMLElement>(".nav-submenu .nav-option:not(.nav-option--disabled)")?.focus();
          }
          break;
        }
        case "ArrowLeft": {
          const active = document.activeElement as HTMLElement;
          const parentSub = active?.closest<HTMLElement>(".nav-option--has-sub");
          if (parentSub && active !== parentSub) {
            e.preventDefault();
            parentSub.classList.remove("is-sub-open");
            parentSub.focus();
          }
          break;
        }
        case "Escape":
          e.preventDefault();
          closeAll();
          trigger?.focus();
          break;
        case "Tab":
          closeAll();
          break;
      }
    });

    // Submenu open/close on hover
    dropdown?.querySelectorAll<HTMLElement>(".nav-option--has-sub").forEach((opt) => {
      opt.setAttribute("tabindex", "-1");
      opt.setAttribute("role", "menuitem");
      opt.addEventListener("mouseenter", () => {
        dropdown
          .querySelectorAll<HTMLElement>(".nav-option--has-sub.is-sub-open")
          .forEach((el) => { if (el !== opt) el.classList.remove("is-sub-open"); });
        opt.classList.add("is-sub-open");
      });

      const submenu = opt.querySelector<HTMLElement>(".nav-submenu");
      submenu?.querySelectorAll<HTMLElement>(".nav-option:not(.nav-option--disabled)").forEach((item) => {
        item.setAttribute("role", "menuitem");
        item.setAttribute("tabindex", "-1");
      });
      submenu?.addEventListener("mouseleave", (e) => {
        const target = e.relatedTarget as Node | null;
        if (!opt.contains(target)) opt.classList.remove("is-sub-open");
      });
    });

    // Leaf option clicks
    dropdown?.querySelectorAll<HTMLElement>(".nav-option:not(.nav-option--has-sub)").forEach((opt) => {
      opt.addEventListener("click", (e) => {
        e.stopPropagation();
        activateOption(opt);
      });
    });
  });

  // Close on outside click
  document.addEventListener("click", closeAll);

  // Keyboard: Escape closes and returns focus
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && activeItem) {
      e.preventDefault();
      const trigger = activeItem.querySelector<HTMLElement>(".nav-trigger");
      closeAll();
      trigger?.focus();
    }
  });

  return { openItem, closeItem, closeAll };
}
