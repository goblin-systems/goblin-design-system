export type TableSortDirection = "asc" | "desc" | null;

export interface TableOptions {
  el: HTMLTableElement;
  onSort?: (column: number, direction: TableSortDirection) => void;
  selectable?: "single" | "multi" | false;
  onSelectionChange?: (selectedIndices: number[]) => void;
  resizable?: boolean;
}

export interface TableHandle {
  getSort(): { column: number; direction: TableSortDirection } | null;
  getSelection(): number[];
  setSelection(indices: number[]): void;
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
  const { el, onSort, selectable = false, onSelectionChange, resizable = false } = options;
  const headers = Array.from(el.querySelectorAll<HTMLTableCellElement>("thead .table-sortable"));
  const tbody = el.tBodies[0];
  let sort: { column: number; direction: TableSortDirection } | null = null;
  const originalRows = tbody ? Array.from(tbody.rows) : [];
  const listeners = new Map<HTMLTableCellElement, EventListener>();

  // ── Selection state ───────────────────────────────────────────────────────
  const selectedIndices = new Set<number>();
  let lastSelectedIndex = -1;
  const rowClickListeners: Array<{ row: HTMLTableRowElement; listener: EventListener }> = [];

  function getRowIndex(row: HTMLTableRowElement): number {
    return originalRows.indexOf(row);
  }

  function applySelectionClasses(): void {
    originalRows.forEach((row, index) => {
      const isSelected = selectedIndices.has(index);
      row.classList.toggle("is-selected", isSelected);
      if (selectable) {
        row.setAttribute("aria-selected", String(isSelected));
      }
    });
  }

  function notifySelectionChange(): void {
    onSelectionChange?.(Array.from(selectedIndices).sort((a, b) => a - b));
  }

  // ── Resize state ──────────────────────────────────────────────────────────
  let resizingColumn = false;
  const resizerElements: HTMLElement[] = [];
  const resizeCleanups: Array<() => void> = [];

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

  // ── Sort binding (unchanged) ──────────────────────────────────────────────
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
      if (resizingColumn) return;
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

  // ── Selection binding ─────────────────────────────────────────────────────
  let tbodyKeydownHandler: ((e: KeyboardEvent) => void) | null = null;

  if (selectable && tbody) {
    // Set aria-multiselectable on the table when in multi mode
    if (selectable === "multi") {
      el.setAttribute("aria-multiselectable", "true");
    }

    // Set role="row" and initial aria-selected + tabindex on each row
    originalRows.forEach((row, index) => {
      row.setAttribute("role", "row");
      row.setAttribute("aria-selected", "false");
      // First row gets tabindex="0", rest get "-1" (roving tabindex)
      row.setAttribute("tabindex", index === 0 ? "0" : "-1");
    });

    originalRows.forEach((row) => {
      const listener: EventListener = (event: Event) => {
        const mouseEvent = event as MouseEvent;
        const rowIndex = getRowIndex(row);
        if (rowIndex === -1) return;

        if (selectable === "single") {
          const wasSelected = selectedIndices.has(rowIndex);
          selectedIndices.clear();
          if (!wasSelected) {
            selectedIndices.add(rowIndex);
          }
          lastSelectedIndex = rowIndex;
        } else {
          // multi mode
          if (mouseEvent.shiftKey && lastSelectedIndex !== -1) {
            // Range select: select from lastSelectedIndex to rowIndex
            const start = Math.min(lastSelectedIndex, rowIndex);
            const end = Math.max(lastSelectedIndex, rowIndex);
            // If not holding ctrl/cmd, clear previous selection first
            if (!mouseEvent.ctrlKey && !mouseEvent.metaKey) {
              selectedIndices.clear();
            }
            for (let i = start; i <= end; i++) {
              selectedIndices.add(i);
            }
          } else if (mouseEvent.ctrlKey || mouseEvent.metaKey) {
            // Toggle individual row
            if (selectedIndices.has(rowIndex)) {
              selectedIndices.delete(rowIndex);
            } else {
              selectedIndices.add(rowIndex);
            }
            lastSelectedIndex = rowIndex;
          } else {
            // Plain click: select only this row
            selectedIndices.clear();
            selectedIndices.add(rowIndex);
            lastSelectedIndex = rowIndex;
          }
        }

        applySelectionClasses();
        notifySelectionChange();
      };

      row.addEventListener("click", listener);
      rowClickListeners.push({ row, listener });
    });

    // ── Keyboard navigation for row selection ─────────────────────────────
    tbodyKeydownHandler = (e: KeyboardEvent) => {
      const focusedRow = (e.target as HTMLElement)?.closest?.("tr");
      if (!focusedRow || !originalRows.includes(focusedRow)) return;

      const currentIndex = originalRows.indexOf(focusedRow);

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const nextIndex = e.key === "ArrowDown"
          ? Math.min(currentIndex + 1, originalRows.length - 1)
          : Math.max(currentIndex - 1, 0);

        const nextRow = originalRows[nextIndex];
        if (nextRow) {
          // Roving tabindex
          focusedRow.setAttribute("tabindex", "-1");
          nextRow.setAttribute("tabindex", "0");
          nextRow.focus();
        }
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const rowIndex = getRowIndex(focusedRow);
        if (rowIndex === -1) return;

        if (selectable === "single") {
          const wasSelected = selectedIndices.has(rowIndex);
          selectedIndices.clear();
          if (!wasSelected) {
            selectedIndices.add(rowIndex);
          }
          lastSelectedIndex = rowIndex;
        } else {
          // multi: Space/Enter toggles the individual row
          if (selectedIndices.has(rowIndex)) {
            selectedIndices.delete(rowIndex);
          } else {
            selectedIndices.add(rowIndex);
          }
          lastSelectedIndex = rowIndex;
        }

        applySelectionClasses();
        notifySelectionChange();
      }
    };

    tbody.addEventListener("keydown", tbodyKeydownHandler);
  }

  // ── Column resize binding ─────────────────────────────────────────────────
  if (resizable) {
    const allHeaders = Array.from(el.querySelectorAll<HTMLTableCellElement>("thead th.table-resizable"));

    allHeaders.slice(0, -1).forEach((th) => {
      const nextTh = th.nextElementSibling as HTMLTableCellElement;

      // Create the resize handle element
      const resizer = document.createElement("div");
      resizer.className = "table-resizer";
      // Ensure the th is positioned so the resizer can be placed absolutely
      if (getComputedStyle(th).position === "static") {
        th.style.position = "relative";
      }
      th.appendChild(resizer);
      resizerElements.push(resizer);

      let startX = 0;
      let startWidth = 0;
      let nextStartWidth = 0;

      const onMouseMove = (e: MouseEvent) => {
        let diff = e.clientX - startX;
        diff = Math.max(diff, 40 - startWidth); // left column can't go below 40
        diff = Math.min(diff, nextStartWidth - 40); // right column can't go below 40
        th.style.width = `${startWidth + diff}px`;
        nextTh.style.width = `${nextStartWidth - diff}px`;
      };

      const onMouseUp = () => {
        el.classList.remove("table-resizing");
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        requestAnimationFrame(() => {
          resizingColumn = false;
        });
      };

      const onMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        resizingColumn = true;
        startX = e.clientX;
        startWidth = th.offsetWidth;
        nextStartWidth = nextTh.offsetWidth;
        el.classList.add("table-resizing");
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      };

      resizer.addEventListener("mousedown", onMouseDown);

      const onResizerClick = (e: MouseEvent) => {
        e.stopPropagation();
      };
      resizer.addEventListener("click", onResizerClick);

      resizeCleanups.push(() => {
        resizer.removeEventListener("mousedown", onMouseDown);
        resizer.removeEventListener("click", onResizerClick);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        resizer.remove();
      });
    });
  }

  render();

  return {
    getSort() {
      return sort;
    },
    getSelection(): number[] {
      return Array.from(selectedIndices).sort((a, b) => a - b);
    },
    setSelection(indices: number[]): void {
      selectedIndices.clear();
      for (const i of indices) {
        if (i >= 0 && i < originalRows.length) {
          selectedIndices.add(i);
        }
      }
      applySelectionClasses();
      notifySelectionChange();
    },
    destroy() {
      // Clean up sort listeners
      listeners.forEach((listener, header) => {
        header.removeEventListener("click", listener);
        header.removeEventListener("keydown", listener);
      });
      listeners.clear();

      // Clean up selection listeners
      rowClickListeners.forEach(({ row, listener }) => {
        row.removeEventListener("click", listener);
      });
      rowClickListeners.length = 0;

      // Clean up keyboard navigation listener
      if (tbodyKeydownHandler && tbody) {
        tbody.removeEventListener("keydown", tbodyKeydownHandler);
      }

      // Clean up resize handles and listeners
      resizeCleanups.forEach((cleanup) => cleanup());
      resizeCleanups.length = 0;
      resizerElements.length = 0;
    },
  };
}
