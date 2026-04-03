export interface ContextMenuItem {
  id?: string;
  label?: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  divider?: boolean;
  onSelect?: () => void;
}

export interface ContextMenuOptions {
  target: HTMLElement | string;
  items: ContextMenuItem[];
}

import { applyIcons } from "../icons";

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

  const render = () => {
    menu.innerHTML = "";
    options.items.forEach((item) => {
      if (item.divider) {
        const divider = document.createElement("div");
        divider.className = "nav-divider";
        menu.appendChild(divider);
        return;
      }

      const button = document.createElement("button");
      button.type = "button";
      button.className = `nav-option${item.disabled ? " nav-option--disabled" : ""}`;
      button.innerHTML = `${item.icon ? `<span class="nav-option-icon"><i data-lucide="${item.icon}"></i></span>` : ""}<span class="nav-option-label">${item.label ?? ""}</span>${item.shortcut ? `<span class="nav-option-shortcut">${item.shortcut}</span>` : ""}`;
      button.addEventListener("click", () => {
        if (item.disabled) return;
        item.onSelect?.();
        close();
      });
      menu.appendChild(button);
    });
  };

  const open = (x: number, y: number) => {
    render();
    menu.classList.add("is-open");
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    applyIcons();
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth - 8) menu.style.left = `${window.innerWidth - rect.width - 8}px`;
    if (rect.bottom > window.innerHeight - 8) menu.style.top = `${window.innerHeight - rect.height - 8}px`;
  };

  const close = () => {
    menu.classList.remove("is-open");
  };

  const onContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    open(event.clientX, event.clientY);
  };

  const onDocumentClick = (event: MouseEvent) => {
    if (!menu.contains(event.target as Node)) close();
  };

  const onEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") close();
  };

  target.addEventListener("contextmenu", onContextMenu);
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onEscape);

  return {
    open,
    close,
    destroy() {
      target.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("keydown", onEscape);
      menu.remove();
    },
  };
}
