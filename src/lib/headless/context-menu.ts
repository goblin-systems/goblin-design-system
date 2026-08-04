import { applyIcons } from "../icons";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface ContextMenuItem {
  id?: string;
  label?: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  divider?: boolean;
  onSelect?: () => void;
  items?: ContextMenuItem[];
}

export interface ContextMenuOptions {
  target: HTMLElement | string;
  items: ContextMenuItem[];
}

export interface ContextMenuHandle {
  open(x: number, y: number): void;
  close(): void;
  destroy(): void;
}

export function bindContextMenu(options: ContextMenuOptions): ContextMenuHandle {
  const target = typeof options.target === "string"
    ? document.querySelector<HTMLElement>(options.target)
    : options.target;

  if (!target) throw new Error("bindContextMenu: target not found");

  const menu = document.createElement("div");
  menu.className = "context-menu nav-dropdown";
  menu.setAttribute("role", "menu");
  document.body.appendChild(menu);

  const isSubmenuItem = (item: ContextMenuItem): boolean => Array.isArray(item.items) && item.items.length > 0;

  // Labels/shortcuts may carry consumer-supplied (potentially user-derived) text,
  // so escape everything interpolated into markup.
  const buildItemMarkup = (item: ContextMenuItem): string => `${item.icon ? `<span class="nav-option-icon"><i data-lucide="${escapeHtml(item.icon)}"></i></span>` : ""}<span class="nav-option-label">${escapeHtml(item.label ?? "")}</span>${item.shortcut ? `<span class="nav-option-shortcut">${escapeHtml(item.shortcut)}</span>` : ""}`;

  const renderItems = (container: HTMLElement, items: ContextMenuItem[]) => {
    container.innerHTML = "";
    items.forEach((item) => {
      if (item.divider) {
        const divider = document.createElement("div");
        divider.className = "nav-divider";
        container.appendChild(divider);
        return;
      }

      if (isSubmenuItem(item)) {
        const wrapper = document.createElement("div");
        wrapper.className = `nav-option nav-option--has-sub${item.disabled ? " nav-option--disabled" : ""}`;
        wrapper.setAttribute("tabindex", item.disabled ? "-1" : "0");
        wrapper.setAttribute("role", "menuitem");
        wrapper.innerHTML = `${buildItemMarkup(item)}<span class="nav-option-arrow"><i data-lucide="chevron-right"></i></span>`;

        const submenu = document.createElement("div");
        submenu.className = "nav-submenu";
        submenu.setAttribute("role", "menu");
        renderItems(submenu, item.items ?? []);
        wrapper.appendChild(submenu);

        wrapper.addEventListener("mouseenter", () => {
          if (item.disabled) return;
          closeSiblingSubmenus(wrapper);
          wrapper.classList.add("is-sub-open");
        });
        wrapper.addEventListener("mouseleave", (event) => {
          const relatedTarget = event.relatedTarget as Node | null;
          if (!wrapper.contains(relatedTarget)) wrapper.classList.remove("is-sub-open");
        });
        wrapper.addEventListener("click", (event) => {
          event.stopPropagation();
          if (item.disabled) return;
          closeSiblingSubmenus(wrapper);
          wrapper.classList.toggle("is-sub-open");
        });

        container.appendChild(wrapper);
        return;
      }

      const button = document.createElement("button");
      button.type = "button";
      button.className = `nav-option${item.disabled ? " nav-option--disabled" : ""}`;
      button.innerHTML = buildItemMarkup(item);
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        if (item.disabled) return;
        item.onSelect?.();
        close();
      });
      container.appendChild(button);
    });
  };

  const closeSiblingSubmenus = (submenuItem: HTMLElement) => {
    submenuItem.parentElement?.querySelectorAll<HTMLElement>(":scope > .nav-option--has-sub.is-sub-open").forEach((candidate) => {
      if (candidate !== submenuItem) candidate.classList.remove("is-sub-open");
    });
  };

  const closeNestedSubmenus = () => {
    menu.querySelectorAll<HTMLElement>(".nav-option--has-sub.is-sub-open").forEach((item) => {
      item.classList.remove("is-sub-open");
    });
  };

  const getVisibleMenuOptions = (): HTMLElement[] => {
    const openSubmenus = [...menu.querySelectorAll<HTMLElement>(".nav-option--has-sub.is-sub-open > .nav-submenu")];
    const activeMenu = openSubmenus.length > 0 ? openSubmenus[openSubmenus.length - 1] : menu;
    return [...activeMenu.querySelectorAll<HTMLElement>(":scope > .nav-option:not(.nav-option--disabled)")];
  };

  const focusFirstOption = () => {
    getVisibleMenuOptions()[0]?.focus();
  };

  const render = () => {
    renderItems(menu, options.items);
  };

  const open = (x: number, y: number) => {
    render();
    menu.classList.add("is-open");
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    closeNestedSubmenus();
    applyIcons();
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth - 8) menu.style.left = `${window.innerWidth - rect.width - 8}px`;
    if (rect.bottom > window.innerHeight - 8) menu.style.top = `${window.innerHeight - rect.height - 8}px`;
    focusFirstOption();
  };

  const close = () => {
    menu.classList.remove("is-open");
    closeNestedSubmenus();
  };

  const onContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    open(event.clientX, event.clientY);
  };

  const onDocumentClick = (event: MouseEvent) => {
    if (!menu.contains(event.target as Node)) close();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!menu.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    const optionsInScope = getVisibleMenuOptions();
    const activeElement = document.activeElement as HTMLElement | null;
    const currentIndex = activeElement ? optionsInScope.indexOf(activeElement) : -1;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      optionsInScope[(currentIndex + 1 + optionsInScope.length) % optionsInScope.length]?.focus();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      optionsInScope[(currentIndex - 1 + optionsInScope.length) % optionsInScope.length]?.focus();
      return;
    }

    if (event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") {
      const submenuItem = activeElement?.classList.contains("nav-option--has-sub") ? activeElement : null;
      if (!submenuItem) return;
      event.preventDefault();
      submenuItem.classList.add("is-sub-open");
      submenuItem.querySelector<HTMLElement>(".nav-submenu > .nav-option:not(.nav-option--disabled), .nav-submenu > .nav-option--has-sub:not(.nav-option--disabled)")?.focus();
      return;
    }

    if (event.key === "ArrowLeft") {
      const parentSubmenu = activeElement?.closest<HTMLElement>(".nav-submenu");
      const parentItem = parentSubmenu?.parentElement as HTMLElement | null;
      if (!parentItem?.classList.contains("nav-option--has-sub")) return;
      event.preventDefault();
      parentItem.classList.remove("is-sub-open");
      parentItem.focus();
    }
  };

  target.addEventListener("contextmenu", onContextMenu);
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onKeyDown);

  return {
    open,
    close,
    destroy() {
      target.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("keydown", onKeyDown);
      menu.remove();
    },
  };
}
