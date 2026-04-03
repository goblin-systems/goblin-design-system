export interface TransferListOptions {
  el: HTMLElement;
}

export interface TransferListHandle {
  getLeft(): string[];
  getRight(): string[];
  destroy(): void;
}

function getSelectedValues(list: HTMLElement) {
  return Array.from(list.querySelectorAll<HTMLButtonElement>(".transfer-list-item.is-selected")).map((item) => item.dataset["value"] ?? item.textContent ?? "");
}

function getAllValues(list: HTMLElement) {
  return Array.from(list.querySelectorAll<HTMLButtonElement>(".transfer-list-item")).map((item) => item.dataset["value"] ?? item.textContent ?? "");
}

export function bindTransferList(options: TransferListOptions): TransferListHandle {
  const { el } = options;
  const left = el.querySelector<HTMLElement>("[data-transfer-list='left']");
  const right = el.querySelector<HTMLElement>("[data-transfer-list='right']");
  const moveRight = el.querySelector<HTMLButtonElement>("[data-transfer-action='to-right']");
  const moveLeft = el.querySelector<HTMLButtonElement>("[data-transfer-action='to-left']");
  const moveAllRight = el.querySelector<HTMLButtonElement>("[data-transfer-action='all-right']");
  const moveAllLeft = el.querySelector<HTMLButtonElement>("[data-transfer-action='all-left']");

  if (!left || !right) throw new Error("bindTransferList: expected left and right lists");

  const toggleItem = (item: HTMLButtonElement) => {
    item.classList.toggle("is-selected");
    item.setAttribute("aria-selected", String(item.classList.contains("is-selected")));
  };

  const bindItems = (scope: ParentNode) => {
    scope.querySelectorAll<HTMLButtonElement>(".transfer-list-item").forEach((item) => {
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", String(item.classList.contains("is-selected")));
      if (item.dataset["transferBound"] === "true") return;
      item.dataset["transferBound"] = "true";
      item.addEventListener("click", () => toggleItem(item));
      item.addEventListener("keydown", (event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          toggleItem(item);
        }
      });
    });
  };

  const move = (from: HTMLElement, to: HTMLElement, all = false) => {
    const items = all
      ? Array.from(from.querySelectorAll<HTMLButtonElement>(".transfer-list-item"))
      : Array.from(from.querySelectorAll<HTMLButtonElement>(".transfer-list-item.is-selected"));
    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      item.classList.remove("is-selected");
      item.setAttribute("aria-selected", "false");
      fragment.appendChild(item);
    });
    to.appendChild(fragment);
  };

  bindItems(el);
  moveRight?.addEventListener("click", () => move(left, right, false));
  moveLeft?.addEventListener("click", () => move(right, left, false));
  moveAllRight?.addEventListener("click", () => move(left, right, true));
  moveAllLeft?.addEventListener("click", () => move(right, left, true));

  return {
    getLeft() {
      return getAllValues(left);
    },
    getRight() {
      return getAllValues(right);
    },
    destroy() {},
  };
}
