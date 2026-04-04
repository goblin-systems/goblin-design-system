export interface DatePickerOptions {
  input: HTMLInputElement;
  min?: string; // "YYYY-MM-DD"
  max?: string; // "YYYY-MM-DD"
  onChange?: (value: string) => void;
}

export interface DatePickerHandle {
  open(): void;
  close(): void;
  getValue(): string;
  setValue(value: string): void;
  destroy(): void;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function parseYMD(str: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  const [year, month, day] = str.split("-").map(Number) as [number, number, number];
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return d;
}

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// ---------------------------------------------------------------------------
// bindDatePicker
// ---------------------------------------------------------------------------

const DAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function bindDatePicker(options: DatePickerOptions): DatePickerHandle {
  const { input, min, max, onChange } = options;

  // Seed state
  let viewYear: number;
  let viewMonth: number; // 0-based
  let selectedDate: Date | null = null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDate = min ? parseYMD(min) : null;
  const maxDate = max ? parseYMD(max) : null;

  // Prepare input
  input.readOnly = true;
  if (!input.placeholder) input.placeholder = "YYYY-MM-DD";

  // ---------------------------------------------------------------------------
  // Build popover DOM (created once, reused)
  // ---------------------------------------------------------------------------

  const popover = document.createElement("div");
  popover.className = "date-picker-popover";
  popover.hidden = true;
  popover.setAttribute("role", "dialog");
  popover.setAttribute("aria-modal", "false");
  popover.setAttribute("aria-label", "Date picker");

  // Header
  const header = document.createElement("div");
  header.className = "date-picker-header";

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = "icon-btn icon-btn-sm";
  prevBtn.setAttribute("aria-label", "Previous month");
  prevBtn.textContent = "\u2039"; // ‹

  const monthYearLabel = document.createElement("span");
  monthYearLabel.className = "date-picker-month-label";

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "icon-btn icon-btn-sm";
  nextBtn.setAttribute("aria-label", "Next month");
  nextBtn.textContent = "\u203a"; // ›

  header.appendChild(prevBtn);
  header.appendChild(monthYearLabel);
  header.appendChild(nextBtn);

  // Grid
  const grid = document.createElement("div");
  grid.className = "date-picker-grid";
  grid.setAttribute("role", "grid");
  grid.setAttribute("aria-label", "Calendar");

  // Day-of-week header row
  const headerRow = document.createElement("div");
  headerRow.className = "date-picker-row date-picker-weekdays";
  headerRow.setAttribute("role", "row");
  DAY_HEADERS.forEach((label) => {
    const cell = document.createElement("div");
    cell.className = "date-picker-weekday";
    cell.setAttribute("role", "columnheader");
    cell.setAttribute("aria-label", label);
    cell.textContent = label;
    headerRow.appendChild(cell);
  });
  grid.appendChild(headerRow);

  popover.appendChild(header);
  popover.appendChild(grid);
  document.body.appendChild(popover);

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  function renderCalendar(): void {
    // Remove existing day rows (keep the weekday header row)
    const rows = grid.querySelectorAll<HTMLElement>(".date-picker-days-row");
    rows.forEach((r) => r.remove());

    monthYearLabel.textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`;

    // First day-of-week for the month (0 = Sunday)
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    // Number of days in the month
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const totalCells = firstDayOfMonth + daysInMonth;
    const totalRows = Math.ceil(totalCells / 7);

    for (let row = 0; row < totalRows; row++) {
      const rowEl = document.createElement("div");
      rowEl.className = "date-picker-row date-picker-days-row";
      rowEl.setAttribute("role", "row");

      for (let col = 0; col < 7; col++) {
        const cellIndex = row * 7 + col;
        const dayNumber = cellIndex - firstDayOfMonth + 1;

        if (dayNumber < 1 || dayNumber > daysInMonth) {
          // Blank leading/trailing cell
          const emptyCell = document.createElement("div");
          emptyCell.className = "date-picker-cell date-picker-empty";
          emptyCell.setAttribute("role", "gridcell");
          rowEl.appendChild(emptyCell);
          continue;
        }

        const cellDate = new Date(viewYear, viewMonth, dayNumber);
        cellDate.setHours(0, 0, 0, 0);

        const isDisabled =
          (minDate !== null && cellDate < minDate) ||
          (maxDate !== null && cellDate > maxDate);
        const isToday = sameDay(cellDate, today);
        const isSelected = selectedDate !== null && sameDay(cellDate, selectedDate);

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "date-picker-cell";
        btn.textContent = String(dayNumber);
        btn.setAttribute("role", "gridcell");
        btn.setAttribute("aria-label", cellDate.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }));

        if (isToday) btn.classList.add("is-today");
        if (isSelected) {
          btn.classList.add("is-selected");
          btn.setAttribute("aria-selected", "true");
        }

        if (isDisabled) {
          btn.classList.add("is-disabled");
          btn.setAttribute("disabled", "");
          btn.setAttribute("aria-disabled", "true");
        } else {
          btn.addEventListener("click", () => {
            const formatted = formatYMD(cellDate);
            input.value = formatted;
            selectedDate = new Date(cellDate);
            onChange?.(formatted);
            close();
          });
        }

        rowEl.appendChild(btn);
      }

      grid.appendChild(rowEl);
    }
  }

  // ---------------------------------------------------------------------------
  // Positioning
  // ---------------------------------------------------------------------------

  function positionPopover(): void {
    const rect = input.getBoundingClientRect();
    popover.style.position = "absolute";
    popover.style.top = `${rect.bottom + window.scrollY}px`;
    popover.style.left = `${rect.left + window.scrollX}px`;
  }

  // ---------------------------------------------------------------------------
  // Open / close
  // ---------------------------------------------------------------------------

  function seedViewFromInput(): void {
    const parsed = parseYMD(input.value);
    selectedDate = parsed;

    const seed = parsed ?? today;
    viewYear = seed.getFullYear();
    viewMonth = seed.getMonth();
  }

  function open(): void {
    seedViewFromInput();
    renderCalendar();
    positionPopover();
    popover.hidden = false;
    popover.classList.add("is-open");
  }

  function close(): void {
    popover.hidden = true;
    popover.classList.remove("is-open");
  }

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  function navigatePrev(): void {
    viewMonth -= 1;
    if (viewMonth < 0) {
      viewMonth = 11;
      viewYear -= 1;
    }
    renderCalendar();
  }

  function navigateNext(): void {
    viewMonth += 1;
    if (viewMonth > 11) {
      viewMonth = 0;
      viewYear += 1;
    }
    renderCalendar();
  }

  // ---------------------------------------------------------------------------
  // Event listeners
  // ---------------------------------------------------------------------------

  const onInputClick = () => {
    if (popover.hidden) {
      open();
    } else {
      close();
    }
  };

  const onDocumentPointerDown = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (!popover.contains(target) && target !== input) {
      close();
    }
  };

  const onDocumentKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && !popover.hidden) {
      event.preventDefault();
      close();
      input.focus();
    }
  };

  const onPrevClick = () => navigatePrev();
  const onNextClick = () => navigateNext();

  input.addEventListener("click", onInputClick);
  prevBtn.addEventListener("click", onPrevClick);
  nextBtn.addEventListener("click", onNextClick);
  document.addEventListener("mousedown", onDocumentPointerDown);
  document.addEventListener("keydown", onDocumentKeydown);

  // ---------------------------------------------------------------------------
  // Handle
  // ---------------------------------------------------------------------------

  return {
    open,
    close,

    getValue(): string {
      return input.value;
    },

    setValue(value: string): void {
      const parsed = parseYMD(value);
      if (!parsed) return;
      input.value = value;
      selectedDate = parsed;
      if (!popover.hidden) {
        viewYear = parsed.getFullYear();
        viewMonth = parsed.getMonth();
        renderCalendar();
      }
    },

    destroy(): void {
      input.removeEventListener("click", onInputClick);
      prevBtn.removeEventListener("click", onPrevClick);
      nextBtn.removeEventListener("click", onNextClick);
      document.removeEventListener("mousedown", onDocumentPointerDown);
      document.removeEventListener("keydown", onDocumentKeydown);
      input.readOnly = false;
      popover.remove();
    },
  };
}

// ---------------------------------------------------------------------------
// bindDateRangePicker
// ---------------------------------------------------------------------------

export interface DateRangePickerOptions {
  startInput: HTMLInputElement;
  endInput: HTMLInputElement;
  min?: string; // "YYYY-MM-DD"
  max?: string; // "YYYY-MM-DD"
  onChange?: (range: { start: string; end: string }) => void;
}

export interface DateRangePickerHandle {
  open(): void;
  close(): void;
  getValue(): { start: string; end: string };
  setValue(start: string, end: string): void;
  destroy(): void;
}

export function bindDateRangePicker(options: DateRangePickerOptions): DateRangePickerHandle {
  const { startInput, endInput, min, max, onChange } = options;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDate = min ? parseYMD(min) : null;
  const maxDate = max ? parseYMD(max) : null;

  let viewYear: number;
  let viewMonth: number;
  let rangeStart: Date | null = null;
  let rangeEnd: Date | null = null;
  let pickingState: "start" | "end" = "start";

  startInput.readOnly = true;
  endInput.readOnly = true;
  if (!startInput.placeholder) startInput.placeholder = "YYYY-MM-DD";
  if (!endInput.placeholder) endInput.placeholder = "YYYY-MM-DD";

  // ── Build popover DOM ────────────────────────────────────────────────────

  const popover = document.createElement("div");
  popover.className = "date-picker-popover";
  popover.hidden = true;
  popover.setAttribute("role", "dialog");
  popover.setAttribute("aria-modal", "false");
  popover.setAttribute("aria-label", "Date range picker");

  const header = document.createElement("div");
  header.className = "date-picker-header";

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = "icon-btn icon-btn-sm";
  prevBtn.setAttribute("aria-label", "Previous month");
  prevBtn.textContent = "\u2039";

  const monthYearLabel = document.createElement("span");
  monthYearLabel.className = "date-picker-month-label";

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "icon-btn icon-btn-sm";
  nextBtn.setAttribute("aria-label", "Next month");
  nextBtn.textContent = "\u203a";

  header.appendChild(prevBtn);
  header.appendChild(monthYearLabel);
  header.appendChild(nextBtn);

  const grid = document.createElement("div");
  grid.className = "date-picker-grid";
  grid.setAttribute("role", "grid");
  grid.setAttribute("aria-label", "Calendar");

  const headerRow = document.createElement("div");
  headerRow.className = "date-picker-row date-picker-weekdays";
  headerRow.setAttribute("role", "row");
  DAY_HEADERS.forEach((label) => {
    const cell = document.createElement("div");
    cell.className = "date-picker-weekday";
    cell.setAttribute("role", "columnheader");
    cell.setAttribute("aria-label", label);
    cell.textContent = label;
    headerRow.appendChild(cell);
  });
  grid.appendChild(headerRow);

  popover.appendChild(header);
  popover.appendChild(grid);
  document.body.appendChild(popover);

  // ── Rendering ────────────────────────────────────────────────────────────

  function renderCalendar(): void {
    const rows = grid.querySelectorAll<HTMLElement>(".date-picker-days-row");
    rows.forEach((r) => r.remove());

    monthYearLabel.textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`;

    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const totalCells = firstDayOfMonth + daysInMonth;
    const totalRows = Math.ceil(totalCells / 7);

    for (let row = 0; row < totalRows; row++) {
      const rowEl = document.createElement("div");
      rowEl.className = "date-picker-row date-picker-days-row";
      rowEl.setAttribute("role", "row");

      for (let col = 0; col < 7; col++) {
        const cellIndex = row * 7 + col;
        const dayNumber = cellIndex - firstDayOfMonth + 1;

        if (dayNumber < 1 || dayNumber > daysInMonth) {
          const emptyCell = document.createElement("div");
          emptyCell.className = "date-picker-cell date-picker-empty";
          emptyCell.setAttribute("role", "gridcell");
          rowEl.appendChild(emptyCell);
          continue;
        }

        const cellDate = new Date(viewYear, viewMonth, dayNumber);
        cellDate.setHours(0, 0, 0, 0);

        const isDisabled =
          (minDate !== null && cellDate < minDate) ||
          (maxDate !== null && cellDate > maxDate);
        const isToday = sameDay(cellDate, today);
        const isStart = rangeStart !== null && sameDay(cellDate, rangeStart);
        const isEnd = rangeEnd !== null && sameDay(cellDate, rangeEnd);
        const isInRange =
          rangeStart !== null &&
          rangeEnd !== null &&
          cellDate > rangeStart &&
          cellDate < rangeEnd;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "date-picker-cell";
        btn.textContent = String(dayNumber);
        btn.setAttribute("role", "gridcell");
        btn.setAttribute("aria-label", cellDate.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }));

        if (isToday) btn.classList.add("is-today");
        if (isStart) {
          btn.classList.add("is-range-start");
          btn.setAttribute("aria-selected", "true");
        }
        if (isEnd) {
          btn.classList.add("is-range-end");
          btn.setAttribute("aria-selected", "true");
        }
        if (isInRange) btn.classList.add("is-in-range");

        if (isDisabled) {
          btn.classList.add("is-disabled");
          btn.setAttribute("disabled", "");
          btn.setAttribute("aria-disabled", "true");
        } else {
          btn.addEventListener("click", () => {
            handleDateClick(cellDate);
          });
        }

        rowEl.appendChild(btn);
      }

      grid.appendChild(rowEl);
    }
  }

  // ── Date click logic ─────────────────────────────────────────────────────

  function handleDateClick(date: Date): void {
    if (pickingState === "start") {
      rangeStart = new Date(date);
      rangeEnd = null;
      startInput.value = formatYMD(date);
      endInput.value = "";
      pickingState = "end";
      renderCalendar();
    } else {
      // pickingState === "end"
      let start = rangeStart!;
      let end = new Date(date);

      // Swap if end < start
      if (end < start) {
        const tmp = start;
        start = end;
        end = tmp;
      }

      rangeStart = start;
      rangeEnd = end;

      const startStr = formatYMD(start);
      const endStr = formatYMD(end);
      startInput.value = startStr;
      endInput.value = endStr;

      pickingState = "start"; // next click resets
      onChange?.({ start: startStr, end: endStr });
      renderCalendar();
      close();
    }
  }

  // ── Positioning ──────────────────────────────────────────────────────────

  function positionPopover(): void {
    const rect = startInput.getBoundingClientRect();
    popover.style.position = "absolute";
    popover.style.top = `${rect.bottom + window.scrollY}px`;
    popover.style.left = `${rect.left + window.scrollX}px`;
  }

  // ── Open / close ─────────────────────────────────────────────────────────

  function seedViewFromInputs(): void {
    const parsedStart = parseYMD(startInput.value);
    const parsedEnd = parseYMD(endInput.value);

    rangeStart = parsedStart;
    rangeEnd = parsedEnd;
    pickingState = rangeStart && rangeEnd ? "start" : rangeStart ? "end" : "start";

    const seed = parsedStart ?? today;
    viewYear = seed.getFullYear();
    viewMonth = seed.getMonth();
  }

  function open(): void {
    seedViewFromInputs();
    renderCalendar();
    positionPopover();
    popover.hidden = false;
    popover.classList.add("is-open");
  }

  function close(): void {
    popover.hidden = true;
    popover.classList.remove("is-open");
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  function navigatePrev(): void {
    viewMonth -= 1;
    if (viewMonth < 0) {
      viewMonth = 11;
      viewYear -= 1;
    }
    renderCalendar();
  }

  function navigateNext(): void {
    viewMonth += 1;
    if (viewMonth > 11) {
      viewMonth = 0;
      viewYear += 1;
    }
    renderCalendar();
  }

  // ── Event listeners ──────────────────────────────────────────────────────

  const onStartInputClick = () => {
    if (popover.hidden) open();
    else close();
  };

  const onEndInputClick = () => {
    if (popover.hidden) open();
    else close();
  };

  const onDocumentPointerDown = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (!popover.contains(target) && target !== startInput && target !== endInput) {
      close();
    }
  };

  const onDocumentKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && !popover.hidden) {
      event.preventDefault();
      close();
      startInput.focus();
    }
  };

  const onPrevClick = () => navigatePrev();
  const onNextClick = () => navigateNext();

  startInput.addEventListener("click", onStartInputClick);
  endInput.addEventListener("click", onEndInputClick);
  prevBtn.addEventListener("click", onPrevClick);
  nextBtn.addEventListener("click", onNextClick);
  document.addEventListener("mousedown", onDocumentPointerDown);
  document.addEventListener("keydown", onDocumentKeydown);

  // ── Handle ───────────────────────────────────────────────────────────────

  return {
    open,
    close,

    getValue(): { start: string; end: string } {
      return {
        start: startInput.value,
        end: endInput.value,
      };
    },

    setValue(start: string, end: string): void {
      const parsedStart = parseYMD(start);
      const parsedEnd = parseYMD(end);
      if (!parsedStart || !parsedEnd) return;

      let s = parsedStart;
      let e = parsedEnd;
      if (e < s) {
        const tmp = s;
        s = e;
        e = tmp;
      }

      rangeStart = s;
      rangeEnd = e;
      startInput.value = formatYMD(s);
      endInput.value = formatYMD(e);
      pickingState = "start";

      if (!popover.hidden) {
        viewYear = s.getFullYear();
        viewMonth = s.getMonth();
        renderCalendar();
      }
    },

    destroy(): void {
      startInput.removeEventListener("click", onStartInputClick);
      endInput.removeEventListener("click", onEndInputClick);
      prevBtn.removeEventListener("click", onPrevClick);
      nextBtn.removeEventListener("click", onNextClick);
      document.removeEventListener("mousedown", onDocumentPointerDown);
      document.removeEventListener("keydown", onDocumentKeydown);
      startInput.readOnly = false;
      endInput.readOnly = false;
      popover.remove();
    },
  };
}
