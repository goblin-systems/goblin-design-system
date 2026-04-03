export type TableSortDirection = "asc" | "desc" | null;

export interface TableOptions {
  el: HTMLTableElement;
  onSort?: (column: number, direction: TableSortDirection) => void;
}

export interface TableHandle {
  getSort(): { column: number; direction: TableSortDirection } | null;
  destroy(): void;
}

function compareValues(a: string, b: string, direction: Exclude<TableSortDirection, null>) {
  const numA = Number(a.replace(/[^\d.-]+/g, ""));
  const numB = Number(b.replace(/[^\d.-]+/g, ""));
  const bothNumeric = Number.isFinite(numA) && Number.isFinite(numB) && a.trim() !== "" && b.trim() !== "";
  const base = bothNumeric ? numA - numB : a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
  return direction === "asc" ? base : -base;
}

export function bindTable(options: TableOptions): TableHandle {
  const { el, onSort } = options;
  const headers = Array.from(el.querySelectorAll<HTMLTableCellElement>("thead .table-sortable"));
  const tbody = el.tBodies[0];
  let sort: { column: number; direction: TableSortDirection } | null = null;
  const originalRows = tbody ? Array.from(tbody.rows) : [];
  const listeners = new Map<HTMLTableCellElement, EventListener>();

  const render = () => {
    headers.forEach((header, index) => {
      const active = sort?.column === index ? sort.direction : null;
      header.classList.toggle("sort-asc", active === "asc");
      header.classList.toggle("sort-desc", active === "desc");
      header.setAttribute("aria-sort", active === "asc" ? "ascending" : active === "desc" ? "descending" : "none");
      header.tabIndex = 0;
      header.setAttribute("role", "columnheader");
    });

    if (!tbody) return;

    const activeSort = sort;
    const rows = activeSort?.direction
      ? [...originalRows].sort((rowA, rowB) => {
          const direction = activeSort.direction === "desc" ? "desc" : "asc";
          const valueA = rowA.cells[activeSort.column]?.textContent?.trim() ?? "";
          const valueB = rowB.cells[activeSort.column]?.textContent?.trim() ?? "";
          return compareValues(valueA, valueB, direction);
        })
      : originalRows;

    const fragment = document.createDocumentFragment();
    rows.forEach((row) => fragment.appendChild(row));
    tbody.appendChild(fragment);
  };

  headers.forEach((header, index) => {
    const activate = () => {
      if (!sort || sort.column !== index) {
        sort = { column: index, direction: "asc" };
      } else if (sort.direction === "asc") {
        sort = { column: index, direction: "desc" };
      } else {
        sort = null;
      }

      render();
      onSort?.(index, sort?.direction ?? null);
    };

    const listener: EventListener = (event) => {
      if (event instanceof KeyboardEvent && event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      activate();
    };

    header.addEventListener("click", listener);
    header.addEventListener("keydown", listener);
    listeners.set(header, listener);
  });

  render();

  return {
    getSort() {
      return sort;
    },
    destroy() {
      listeners.forEach((listener, header) => {
        header.removeEventListener("click", listener);
        header.removeEventListener("keydown", listener);
      });
      listeners.clear();
    },
  };
}
