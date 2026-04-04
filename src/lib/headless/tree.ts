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

  // ── ARIA setup: roles, levels, set sizes, roving tabindex ────────────────
  function getItemDepth(item: HTMLElement): number {
    let depth = 1;
    let parent = item.parentElement?.closest<HTMLElement>(".tree-item");
    while (parent) {
      depth++;
      parent = parent.parentElement?.closest<HTMLElement>(".tree-item");
    }
    return depth;
  }

  // Set role="group" on all .tree-branch elements (child lists)
  el.querySelectorAll<HTMLElement>(".tree-branch").forEach((branch) => {
    branch.setAttribute("role", "group");
  });

  // Set ARIA attributes on each tree item's focusable element
  items.forEach((item) => {
    const focusable = item.querySelector<HTMLElement>(":scope > .tree-row > .tree-toggle, :scope > .tree-row > .tree-leaf");
    if (!focusable) return;

    focusable.setAttribute("role", "treeitem");

    const depth = getItemDepth(item);
    focusable.setAttribute("aria-level", String(depth));

    // Compute setsize and posinset among siblings
    const parentBranch = item.parentElement;
    if (parentBranch) {
      const siblings = Array.from(parentBranch.querySelectorAll<HTMLElement>(":scope > .tree-item"));
      focusable.setAttribute("aria-setsize", String(siblings.length));
      focusable.setAttribute("aria-posinset", String(siblings.indexOf(item) + 1));
    }

    // Roving tabindex: all start at -1
    focusable.setAttribute("tabindex", "-1");
  });

  // Set the first visible node to tabindex="0"
  const initialNodes = getVisibleNodes(el);
  if (initialNodes.length > 0) {
    initialNodes[0]!.setAttribute("tabindex", "0");
  }

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
    const clamped = Math.max(0, Math.min(index, nodes.length - 1));
    const target = nodes[clamped];
    if (target) {
      // Roving tabindex: reset all, set target to 0
      nodes.forEach((n) => n.setAttribute("tabindex", "-1"));
      target.setAttribute("tabindex", "0");
      target.focus();
    }
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

  const keydownHandler = (event: KeyboardEvent) => {
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
        if (currentItem?.classList.contains("is-open")) {
          collapse(currentItem);
        } else {
          const parentToggle = currentItem?.parentElement?.closest<HTMLElement>(".tree-item")?.querySelector<HTMLElement>(".tree-toggle");
          if (parentToggle) {
            // Update roving tabindex for parent focus
            nodes.forEach((n) => n.setAttribute("tabindex", "-1"));
            parentToggle.setAttribute("tabindex", "0");
            parentToggle.focus();
          }
        }
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
  };

  el.addEventListener("keydown", keydownHandler);

  return {
    expand,
    collapse,
    expandAll() {
      items.forEach(expand);
    },
    collapseAll() {
      items.forEach(collapse);
    },
    destroy() {
      el.removeEventListener("keydown", keydownHandler);
    },
  };
}
