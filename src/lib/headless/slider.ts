// ── Types ─────────────────────────────────────────────────────────────────────

export interface SliderOptions {
  /** The `.slider` container element. */
  el: HTMLElement;
  /** Minimum value. Default 0. */
  min?: number;
  /** Maximum value. Default 100. */
  max?: number;
  /** Step size. Default 1. */
  step?: number;
  /** Initial value. Defaults to `min`. */
  value?: number;
  /**
   * Track direction. Vertical reads low-to-high bottom-to-top, matching a
   * fader — add the `.slider--vertical` modifier class to `el` to match.
   * Default "horizontal".
   */
  orientation?: "horizontal" | "vertical";
  /** Accessible label for the thumb. */
  label?: string;
  /** Called continuously while the value changes (drag, click, keyboard). */
  onChange?: (value: number) => void;
}

export interface SliderHandle {
  /** Programmatically set the thumb position. Does not call `onChange`. */
  setValue(value: number): void;
  /** Read the current value. */
  getValue(): number;
  /** Remove all event listeners. */
  destroy(): void;
}

// ── Implementation ────────────────────────────────────────────────────────────

export function bindSlider(options: SliderOptions): SliderHandle {
  const {
    el,
    min = 0,
    max = 100,
    step = 1,
    orientation = "horizontal",
    label,
    onChange,
  } = options;

  const vertical = orientation === "vertical";
  const track = el.querySelector<HTMLElement>(".slider-track")!;
  const fill = el.querySelector<HTMLElement>(".slider-fill")!;
  const thumb = el.querySelector<HTMLElement>(".slider-thumb")!;

  let value = options.value ?? min;

  // ── Helpers ──────────────────────────────────────────────────────────────

  function snap(raw: number): number {
    return Math.round((raw - min) / step) * step + min;
  }

  function clamp(v: number): number {
    return Math.max(min, Math.min(max, v));
  }

  function pct(v: number): number {
    return ((v - min) / (max - min)) * 100;
  }

  function update() {
    const p = pct(value);
    if (vertical) {
      thumb.style.bottom = `${p}%`;
      fill.style.height = `${p}%`;
    } else {
      thumb.style.left = `${p}%`;
      fill.style.width = `${p}%`;
    }
    thumb.setAttribute("aria-valuenow", String(value));
    thumb.setAttribute("aria-valuetext", String(value));
  }

  // ── Drag ─────────────────────────────────────────────────────────────────

  function valueFromClientPoint(clientX: number, clientY: number): number {
    const rect = track.getBoundingClientRect();
    const ratio = vertical
      ? clamp01((rect.bottom - clientY) / rect.height)
      : clamp01((clientX - rect.left) / rect.width);
    return snap(min + ratio * (max - min));
  }

  function clamp01(v: number): number {
    return Math.max(0, Math.min(1, v));
  }

  function startDrag(startEvent: PointerEvent) {
    startEvent.preventDefault();
    thumb.classList.add("is-dragging");
    thumb.setPointerCapture(startEvent.pointerId);

    function onMove(e: PointerEvent) {
      value = clamp(valueFromClientPoint(e.clientX, e.clientY));
      update();
      onChange?.(value);
    }

    function onUp(e: PointerEvent) {
      thumb.classList.remove("is-dragging");
      thumb.releasePointerCapture(e.pointerId);
      thumb.removeEventListener("pointermove", onMove);
      thumb.removeEventListener("pointerup", onUp);
    }

    thumb.addEventListener("pointermove", onMove);
    thumb.addEventListener("pointerup", onUp);
  }

  // ── Track click: jump to point ──────────────────────────────────────────

  function onTrackClick(e: MouseEvent) {
    if ((e.target as HTMLElement).closest(".slider-thumb")) return;
    value = clamp(valueFromClientPoint(e.clientX, e.clientY));
    update();
    onChange?.(value);
  }

  // ── Keyboard ─────────────────────────────────────────────────────────────

  function onKeyDown(e: KeyboardEvent) {
    let delta = 0;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":   delta = +step; break;
      case "ArrowLeft":
      case "ArrowDown": delta = -step; break;
      case "PageUp":    delta = +step * 10; break;
      case "PageDown":  delta = -step * 10; break;
      case "Home":      value = min; update(); onChange?.(value); return;
      case "End":       value = max; update(); onChange?.(value); return;
      default: return;
    }
    e.preventDefault();
    value = clamp(snap(value + delta));
    update();
    onChange?.(value);
  }

  // ── Wire up ───────────────────────────────────────────────────────────────

  thumb.setAttribute("role", "slider");
  thumb.setAttribute("tabindex", "0");
  if (label) thumb.setAttribute("aria-label", label);
  thumb.setAttribute("aria-valuemin", String(min));
  thumb.setAttribute("aria-valuemax", String(max));
  if (vertical) thumb.setAttribute("aria-orientation", "vertical");

  thumb.addEventListener("pointerdown", startDrag);
  thumb.addEventListener("keydown", onKeyDown);
  track.addEventListener("click", onTrackClick);

  update();

  return {
    setValue(newValue) {
      value = clamp(snap(newValue));
      update();
    },
    getValue() {
      return value;
    },
    destroy() {
      thumb.removeEventListener("pointerdown", startDrag);
      thumb.removeEventListener("keydown", onKeyDown);
      track.removeEventListener("click", onTrackClick);
    },
  };
}
