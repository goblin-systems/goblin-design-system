// ── Types ─────────────────────────────────────────────────────────────────────

export interface RangeOptions {
  /** The `.range-slider` container element. */
  el: HTMLElement;
  /** Minimum value. Default 0. */
  min?: number;
  /** Maximum value. Default 100. */
  max?: number;
  /** Step size. Default 1. */
  step?: number;
  /** Initial [lo, hi] values. Defaults to [min, max]. */
  value?: [number, number];
  /**
   * Invert the fill: highlights the area outside the two thumbs (< lo and > hi)
   * rather than between them. Requires a `.range-fill-end` sibling in the markup.
   */
  inverted?: boolean;
  /** Called whenever either thumb changes value. */
  onChange?: (lo: number, hi: number) => void;
}

export interface RangeHandle {
  /** Programmatically set both thumb positions. */
  setValue(lo: number, hi: number): void;
  /** Read current [lo, hi] values. */
  getValue(): [number, number];
  /** Remove all event listeners. */
  destroy(): void;
}

// ── Implementation ────────────────────────────────────────────────────────────

export function bindRange(options: RangeOptions): RangeHandle {
  const {
    el,
    min = 0,
    max = 100,
    step = 1,
    inverted = false,
    onChange,
  } = options;

  const track   = el.querySelector<HTMLElement>(".range-track")!;
  const fill    = el.querySelector<HTMLElement>(".range-fill")!;
  const fillEnd = el.querySelector<HTMLElement>(".range-fill-end") ?? null;
  const loThumb = el.querySelector<HTMLElement>('[data-thumb="lo"]')!;
  const hiThumb = el.querySelector<HTMLElement>('[data-thumb="hi"]')!;
  const loLabel = el.querySelector<HTMLElement>(".range-label-lo") ?? null;
  const hiLabel = el.querySelector<HTMLElement>(".range-label-hi") ?? null;

  let lo = options.value?.[0] ?? min;
  let hi = options.value?.[1] ?? max;

  // ── Helpers ──────────────────────────────────────────────────────────────

  function snap(raw: number): number {
    return Math.round((raw - min) / step) * step + min;
  }

  function clamp(v: number, a: number, b: number): number {
    return Math.max(a, Math.min(b, v));
  }

  function pct(v: number): number {
    return ((v - min) / (max - min)) * 100;
  }

  function update() {
    const loPct = pct(lo);
    const hiPct = pct(hi);

    loThumb.style.left = `${loPct}%`;
    hiThumb.style.left = `${hiPct}%`;

    if (inverted) {
      fill.style.left  = "0%";
      fill.style.width = `${loPct}%`;
      if (fillEnd) {
        fillEnd.style.left  = `${hiPct}%`;
        fillEnd.style.width = `${100 - hiPct}%`;
      }
    } else {
      fill.style.left  = `${loPct}%`;
      fill.style.width = `${hiPct - loPct}%`;
    }

    loThumb.setAttribute("aria-valuenow", String(lo));
    hiThumb.setAttribute("aria-valuenow", String(hi));
    loThumb.setAttribute("aria-valuetext", String(lo));
    hiThumb.setAttribute("aria-valuetext", String(hi));

    if (loLabel) loLabel.textContent = String(lo);
    if (hiLabel) hiLabel.textContent = String(hi);
  }

  // ── Drag ─────────────────────────────────────────────────────────────────

  function valueFromClientX(clientX: number): number {
    const rect = track.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    return snap(min + ratio * (max - min));
  }

  function startDrag(thumb: "lo" | "hi", startEvent: PointerEvent) {
    startEvent.preventDefault();
    const el_ = thumb === "lo" ? loThumb : hiThumb;
    el_.classList.add("is-dragging");
    el_.setPointerCapture(startEvent.pointerId);

    function onMove(e: PointerEvent) {
      const v = valueFromClientX(e.clientX);
      if (thumb === "lo") {
        lo = clamp(v, min, hi);
      } else {
        hi = clamp(v, lo, max);
      }
      update();
      onChange?.(lo, hi);
    }

    function onUp(e: PointerEvent) {
      el_.classList.remove("is-dragging");
      el_.releasePointerCapture(e.pointerId);
      el_.removeEventListener("pointermove", onMove);
      el_.removeEventListener("pointerup", onUp);
    }

    el_.addEventListener("pointermove", onMove);
    el_.addEventListener("pointerup", onUp);
  }

  // ── Track click: move nearest thumb ──────────────────────────────────────

  function onTrackClick(e: MouseEvent) {
    if ((e.target as HTMLElement).closest(".range-thumb")) return;
    const v = valueFromClientX(e.clientX);
    const dLo = Math.abs(v - lo);
    const dHi = Math.abs(v - hi);
    if (dLo <= dHi) {
      lo = clamp(v, min, hi);
    } else {
      hi = clamp(v, lo, max);
    }
    update();
    onChange?.(lo, hi);
  }

  // ── Keyboard ─────────────────────────────────────────────────────────────

  function onKeyDown(e: KeyboardEvent) {
    const thumb = (e.currentTarget as HTMLElement).dataset["thumb"] as "lo" | "hi";
    let delta = 0;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":   delta = +step; break;
      case "ArrowLeft":
      case "ArrowDown": delta = -step; break;
      case "PageUp":    delta = +step * 10; break;
      case "PageDown":  delta = -step * 10; break;
      case "Home":
        if (thumb === "lo") { lo = min; update(); onChange?.(lo, hi); } return;
      case "End":
        if (thumb === "hi") { hi = max; update(); onChange?.(lo, hi); } return;
      default: return;
    }

    e.preventDefault();
    if (thumb === "lo") {
      lo = clamp(snap(lo + delta), min, hi);
    } else {
      hi = clamp(snap(hi + delta), lo, max);
    }
    update();
    onChange?.(lo, hi);
  }

  // ── Wire up ───────────────────────────────────────────────────────────────

  loThumb.setAttribute("role", "slider");
  loThumb.setAttribute("tabindex", "0");
  loThumb.setAttribute("aria-label", "Minimum");
  loThumb.setAttribute("aria-valuemin", String(min));
  loThumb.setAttribute("aria-valuemax", String(max));

  hiThumb.setAttribute("role", "slider");
  hiThumb.setAttribute("tabindex", "0");
  hiThumb.setAttribute("aria-label", "Maximum");
  hiThumb.setAttribute("aria-valuemin", String(min));
  hiThumb.setAttribute("aria-valuemax", String(max));

  loThumb.addEventListener("pointerdown", (e) => startDrag("lo", e));
  hiThumb.addEventListener("pointerdown", (e) => startDrag("hi", e));
  loThumb.addEventListener("keydown", onKeyDown);
  hiThumb.addEventListener("keydown", onKeyDown);
  track.addEventListener("click", onTrackClick);

  update();

  return {
    setValue(newLo, newHi) {
      lo = clamp(snap(newLo), min, max);
      hi = clamp(snap(newHi), min, max);
      if (lo > hi) [lo, hi] = [hi, lo];
      update();
    },
    getValue(): [number, number] {
      return [lo, hi];
    },
    destroy() {
      loThumb.removeEventListener("pointerdown", (e) => startDrag("lo", e));
      hiThumb.removeEventListener("pointerdown", (e) => startDrag("hi", e));
      loThumb.removeEventListener("keydown", onKeyDown);
      hiThumb.removeEventListener("keydown", onKeyDown);
      track.removeEventListener("click", onTrackClick);
    },
  };
}
