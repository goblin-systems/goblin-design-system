export interface PaginationOptions {
  /** The `.pagination` container element. */
  el: HTMLElement;
  /** Total number of pages. */
  totalPages: number;
  /** Currently active page (1-indexed). Default 1. */
  currentPage?: number;
  /** How many page buttons to show around the active page. Default 2. */
  siblingCount?: number;
  /** Called when user navigates to a new page. */
  onChange?: (page: number) => void;
}

export interface PaginationHandle {
  setPage(page: number): void;
  getPage(): number;
  setTotalPages(total: number): void;
  destroy(): void;
}

const PREV_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
const NEXT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;

export function bindPagination(options: PaginationOptions): PaginationHandle {
  const { el, siblingCount = 2, onChange } = options;

  let totalPages = options.totalPages;
  let current = Math.max(1, Math.min(options.currentPage ?? 1, totalPages));

  function pages(): (number | "…")[] {
    const result: (number | "…")[] = [];
    const lo = Math.max(2, current - siblingCount);
    const hi = Math.min(totalPages - 1, current + siblingCount);

    result.push(1);
    if (lo > 2) result.push("…");
    for (let i = lo; i <= hi; i++) result.push(i);
    if (hi < totalPages - 1) result.push("…");
    if (totalPages > 1) result.push(totalPages);
    return result;
  }

  function goTo(page: number) {
    if (page < 1 || page > totalPages || page === current) return;
    current = page;
    render();
    onChange?.(current);
  }

  function render() {
    el.innerHTML = "";

    const prev = document.createElement("button");
    prev.className = "page-btn";
    prev.setAttribute("aria-label", "Previous");
    prev.disabled = current === 1;
    prev.innerHTML = PREV_SVG;
    prev.addEventListener("click", () => goTo(current - 1));
    el.appendChild(prev);

    for (const p of pages()) {
      if (p === "…") {
        const ell = document.createElement("span");
        ell.className = "page-ellipsis";
        ell.textContent = "…";
        ell.setAttribute("aria-hidden", "true");
        el.appendChild(ell);
      } else {
        const btn = document.createElement("button");
        btn.className = `page-btn${p === current ? " is-active" : ""}`;
        btn.textContent = String(p);
        if (p === current) btn.setAttribute("aria-current", "page");
        btn.addEventListener("click", () => goTo(p as number));
        el.appendChild(btn);
      }
    }

    const next = document.createElement("button");
    next.className = "page-btn";
    next.setAttribute("aria-label", "Next");
    next.disabled = current === totalPages;
    next.innerHTML = NEXT_SVG;
    next.addEventListener("click", () => goTo(current + 1));
    el.appendChild(next);

    el.setAttribute("aria-label", el.getAttribute("aria-label") ?? "Pagination");
  }

  render();

  return {
    setPage: goTo,
    getPage: () => current,
    setTotalPages(total: number) {
      totalPages = Math.max(1, total);
      current = Math.min(current, totalPages);
      render();
    },
    destroy() { el.innerHTML = ""; },
  };
}
