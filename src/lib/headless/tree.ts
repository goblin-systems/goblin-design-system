export interface TreeOptions {
  el: HTMLElement;
}

export interface CheckboxTreeOptions extends TreeOptions {
  onChange?: (checkedValues: string[]) => void;
}

export interface TreeHandle {
  expand(item: HTMLElement): void;
  collapse(item: HTMLElement): void;
  expandAll(): void;
  collapseAll(): void;
  destroy(): void;
}

function getVisibleNodes(el: HTMLElement) {
  return Array.from(el.querySelectorAll<HTMLElement>(".tree-toggle, .tree-leaf"));
}

export function bindCheckboxTree(options: CheckboxTreeOptions): TreeHandle {
  const { el, onChange } = options;
  const treeHandle = bindTree({ el });

  function getCheckbox(item: HTMLElement): HTMLInputElement | null {
    return item.querySelector<HTMLInputElement>(":scope > .tree-row > .tree-check");
  }

  function getChildItems(item: HTMLElement): HTMLElement[] {
    return Array.from(item.querySelectorAll<HTMLElement>(":scope > .tree-branch > .tree-item"));
  }

  function setDescendants(item: HTMLElement, checked: boolean) {
    getChildItems(item).forEach((child) => {
      const cb = getCheckbox(child);
      if (cb) {
        cb.checked = checked;
        cb.indeterminate = false;
      }
      setDescendants(child, checked);
    });
  }

  function updateAncestors(item: HTMLElement) {
    const parentItem = item.parentElement?.closest<HTMLElement>(".tree-item");
    if (!parentItem) return;

    const parentCb = getCheckbox(parentItem);
    if (!parentCb) return;

    const childCbs = getChildItems(parentItem)
      .map((child) => getCheckbox(child))
      .filter((cb): cb is HTMLInputElement => cb !== null);

    if (childCbs.length === 0) return;

    const allChecked = childCbs.every((cb) => cb.checked && !cb.indeterminate);
    const noneChecked = childCbs.every((cb) => !cb.checked && !cb.indeterminate);

    if (allChecked) {
      parentCb.checked = true;
      parentCb.indeterminate = false;
    } else if (noneChecked) {
      parentCb.checked = false;
      parentCb.indeterminate = false;
    } else {
      parentCb.checked = false;
      parentCb.indeterminate = true;
    }

    updateAncestors(parentItem);
  }

  function getCheckedValues(): string[] {
    return Array.from(el.querySelectorAll<HTMLInputElement>(".tree-check:checked"))
      .filter((cb) => !cb.indeterminate)
      .map((cb) => cb.closest<HTMLElement>(".tree-item")?.dataset["value"] ?? "")
      .filter(Boolean);
  }

  Array.from(el.querySelectorAll<HTMLElement>(".tree-item")).forEach((item) => {
    const cb = getCheckbox(item);
    if (!cb) return;

    cb.addEventListener("change", () => {
      cb.indeterminate = false;
      const isFolder = item.querySelector(":scope > .tree-branch") !== null;
      if (isFolder) {
        setDescendants(item, cb.checked);
      }
      updateAncestors(item);
      onChange?.(getCheckedValues());
    });
  });

  return treeHandle;
}

export function bindTree(options: TreeOptions): TreeHandle {
  const { el } = options;
  const items = Array.from(el.querySelectorAll<HTMLElement>(".tree-item"));

  const expand = (item: HTMLElement) => {
    item.classList.add("is-open");
    item.querySelector<HTMLElement>(".tree-toggle")?.setAttribute("aria-expanded", "true");
  };

  const collapse = (item: HTMLElement) => {
    item.classList.remove("is-open");
    item.querySelector<HTMLElement>(".tree-toggle")?.setAttribute("aria-expanded", "false");
  };

  const focusNode = (index: number) => {
    const nodes = getVisibleNodes(el);
    nodes[Math.max(0, Math.min(index, nodes.length - 1))]?.focus();
  };

  items.forEach((item) => {
    const toggle = item.querySelector<HTMLButtonElement>(".tree-toggle");
    const branch = item.querySelector<HTMLElement>(":scope > .tree-branch");
    toggle?.setAttribute("aria-expanded", String(item.classList.contains("is-open")));
    toggle?.addEventListener("click", () => {
      if (!branch) return;
      if (item.classList.contains("is-open")) collapse(item);
      else expand(item);
    });
  });

  el.addEventListener("keydown", (event) => {
    const nodes = getVisibleNodes(el);
    const currentIndex = nodes.indexOf(document.activeElement as HTMLElement);
    const currentItem = (document.activeElement as HTMLElement)?.closest<HTMLElement>(".tree-item");

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusNode(currentIndex + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusNode(currentIndex - 1);
        break;
      case "ArrowRight":
        event.preventDefault();
        if (currentItem && !currentItem.classList.contains("is-open")) expand(currentItem);
        else focusNode(currentIndex + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        if (currentItem?.classList.contains("is-open")) collapse(currentItem);
        else currentItem?.parentElement?.closest<HTMLElement>(".tree-item")?.querySelector<HTMLElement>(".tree-toggle")?.focus();
        break;
      case "Enter":
      case " ":
        if (document.activeElement instanceof HTMLButtonElement && document.activeElement.classList.contains("tree-toggle")) {
          event.preventDefault();
          document.activeElement.click();
        }
        break;
      case "*": {
        event.preventDefault();
        currentItem?.parentElement?.querySelectorAll<HTMLElement>(":scope > .tree-item").forEach(expand);
        break;
      }
    }
  });

  return {
    expand,
    collapse,
    expandAll() {
      items.forEach(expand);
    },
    collapseAll() {
      items.forEach(collapse);
    },
    destroy() {},
  };
}
