export interface RadialOptions {
  /** The `.radial-control` container element. */
  el: HTMLElement;
  /** Minimum value. Default 0. */
  min?: number;
  /** Maximum value. Default 360. */
  max?: number;
  /** Step size. Default 1. */
  step?: number;
  /** Initial value. Defaults to `min`. */
  value?: number;
  /** Angle where the allowed sweep starts. Default -90 (top). */
  startAngle?: number;
  /** Angle where the allowed sweep ends. Default 270 (full circle). */
  endAngle?: number;
  /** Optional display formatter for `.radial-control-value`. */
  formatValue?: (value: number) => string;
  /** Called whenever the value changes. */
  onChange?: (value: number) => void;
}

export interface RadialHandle {
  /** Programmatically set the current value. */
  setValue(value: number): void;
  /** Read the current value. */
  getValue(): number;
  /** Remove all event listeners. */
  destroy(): void;
}

const CENTER = 50;
const TRACK_RADIUS = 38;
const POINTER_RADIUS = 28;
const EPSILON = 0.000001;

export function bindRadial(options: RadialOptions): RadialHandle {
  const {
    el,
    min = 0,
    max = 360,
    step = 1,
    startAngle = -90,
    endAngle = 270,
    formatValue,
    onChange,
  } = options;

  if (max <= min) {
    throw new Error("bindRadial: max must be greater than min");
  }
  if (step <= 0) {
    throw new Error("bindRadial: step must be greater than 0");
  }

  const visualEl = el.querySelector<SVGSVGElement>(".radial-control-visual");
  if (!visualEl) {
    throw new Error("bindRadial: .radial-control-visual is required");
  }
  const visual = visualEl;

  const track = ensurePath(visual, ".radial-control-track");
  const fill = ensurePath(visual, ".radial-control-fill");
  const pointer = ensureLine(visual, ".radial-control-pointer");
  const thumb = ensureCircle(visual, ".radial-control-thumb");
  const valueLabel = el.querySelector<HTMLElement>(".radial-control-value");

  const totalSweep = getSweep(startAngle, endAngle);
  const fullCircle = Math.abs(totalSweep - 360) < EPSILON;

  function countDecimals(input: number): number {
    const text = `${input}`;
    const index = text.indexOf(".");
    return index === -1 ? 0 : text.length - index - 1;
  }

  const precision = Math.max(countDecimals(step), countDecimals(min), countDecimals(max));

  function round(valueToRound: number): number {
    return Number(valueToRound.toFixed(precision));
  }

  function snap(raw: number): number {
    return round(Math.round((raw - min) / step) * step + min);
  }

  function clamp(raw: number): number {
    return Math.max(min, Math.min(max, raw));
  }

  function clampAndSnap(raw: number): number {
    return clamp(snap(raw));
  }

  let value = clampAndSnap(options.value ?? min);
  let activePointerId: number | null = null;

  function valueRatio(nextValue: number): number {
    return (nextValue - min) / (max - min);
  }

  function angleForValue(nextValue: number): number {
    return startAngle + valueRatio(nextValue) * totalSweep;
  }

  function valueFromAngle(angle: number): number {
    const normalizedStart = normalizeAngle(startAngle);
    const normalizedEnd = normalizeAngle(startAngle + totalSweep);
    const relative = normalizeAngle(angle - normalizedStart);

    let ratio = 0;
    if (fullCircle) {
      ratio = relative / 360;
    } else if (relative <= totalSweep) {
      ratio = relative / totalSweep;
    } else {
      const startDistance = shortestAngleDistance(angle, normalizedStart);
      const endDistance = shortestAngleDistance(angle, normalizedEnd);
      ratio = endDistance < startDistance ? 1 : 0;
    }

    return clampAndSnap(min + ratio * (max - min));
  }

  function update() {
    const currentAngle = angleForValue(value);
    const currentPoint = polarToCartesian(currentAngle, TRACK_RADIUS);
    const pointerPoint = polarToCartesian(currentAngle, POINTER_RADIUS);

    track.setAttribute("d", describeArc(startAngle, startAngle + totalSweep, TRACK_RADIUS, true));
    fill.setAttribute("d", describeArc(startAngle, currentAngle, TRACK_RADIUS, fullCircle && value === max));
    pointer.setAttribute("x1", `${CENTER}`);
    pointer.setAttribute("y1", `${CENTER}`);
    pointer.setAttribute("x2", `${pointerPoint.x}`);
    pointer.setAttribute("y2", `${pointerPoint.y}`);
    thumb.setAttribute("cx", `${currentPoint.x}`);
    thumb.setAttribute("cy", `${currentPoint.y}`);

    el.setAttribute("aria-valuenow", `${value}`);
    el.setAttribute("aria-valuetext", formatValue ? formatValue(value) : `${value}`);
    if (valueLabel) valueLabel.textContent = formatValue ? formatValue(value) : `${value}`;
  }

  function setValue(nextValue: number, emit = false) {
    const snappedValue = clampAndSnap(nextValue);
    if (snappedValue === value) return;
    value = snappedValue;
    update();
    if (emit) onChange?.(value);
  }

  function setFromPointer(clientX: number, clientY: number, emit: boolean) {
    const rect = visual.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    if (Math.abs(dx) < EPSILON && Math.abs(dy) < EPSILON) return;
    const angle = radiansToDegrees(Math.atan2(dy, dx));
    setValue(valueFromAngle(angle), emit);
  }

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0 && event.pointerType !== "touch") return;
    event.preventDefault();
    activePointerId = event.pointerId;
    el.classList.add("is-dragging");
    el.focus();

    el.setPointerCapture(event.pointerId);

    setFromPointer(event.clientX, event.clientY, true);
  }

  function onPointerMove(event: PointerEvent) {
    if (event.pointerId !== activePointerId) return;
    event.preventDefault();
    setFromPointer(event.clientX, event.clientY, true);
  }

  function stopDragging(pointerId: number | null) {
    if (pointerId !== null && el.hasPointerCapture(pointerId)) {
      el.releasePointerCapture(pointerId);
    }
    activePointerId = null;
    el.classList.remove("is-dragging");
  }

  function onPointerUp(event: PointerEvent) {
    if (event.pointerId !== activePointerId) return;
    stopDragging(event.pointerId);
  }

  function onLostPointerCapture(event: PointerEvent) {
    if (event.pointerId !== activePointerId) return;
    stopDragging(null);
  }

  function onKeyDown(event: KeyboardEvent) {
    let delta = 0;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        delta = step;
        break;
      case "ArrowLeft":
      case "ArrowDown":
        delta = -step;
        break;
      case "PageUp":
        delta = step * 10;
        break;
      case "PageDown":
        delta = -step * 10;
        break;
      case "Home":
        event.preventDefault();
        setValue(min, true);
        return;
      case "End":
        event.preventDefault();
        setValue(max, true);
        return;
      default:
        return;
    }

    event.preventDefault();
    setValue(value + delta, true);
  }

  el.setAttribute("role", "slider");
  el.setAttribute("tabindex", "0");
  el.setAttribute("aria-label", "Angle");
  el.setAttribute("aria-valuemin", `${min}`);
  el.setAttribute("aria-valuemax", `${max}`);
  visual.setAttribute("viewBox", "0 0 100 100");
  visual.setAttribute("aria-hidden", "true");

  el.addEventListener("pointerdown", onPointerDown);
  el.addEventListener("pointermove", onPointerMove);
  el.addEventListener("pointerup", onPointerUp);
  el.addEventListener("pointercancel", onPointerUp);
  el.addEventListener("lostpointercapture", onLostPointerCapture);
  el.addEventListener("keydown", onKeyDown);

  update();

  return {
    setValue(nextValue: number) {
      setValue(nextValue, false);
    },
    getValue() {
      return value;
    },
    destroy() {
      stopDragging(activePointerId);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("lostpointercapture", onLostPointerCapture);
      el.removeEventListener("keydown", onKeyDown);
    },
  };
}

function ensurePath(root: ParentNode, selector: string): SVGPathElement {
  const node = root.querySelector<SVGPathElement>(selector);
  if (!node) throw new Error(`bindRadial: ${selector} is required`);
  return node;
}

function ensureLine(root: ParentNode, selector: string): SVGLineElement {
  const node = root.querySelector<SVGLineElement>(selector);
  if (!node) throw new Error(`bindRadial: ${selector} is required`);
  return node;
}

function ensureCircle(root: ParentNode, selector: string): SVGCircleElement {
  const node = root.querySelector<SVGCircleElement>(selector);
  if (!node) throw new Error(`bindRadial: ${selector} is required`);
  return node;
}

function normalizeAngle(angle: number): number {
  const normalized = angle % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function shortestAngleDistance(a: number, b: number): number {
  const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return Math.min(diff, 360 - diff);
}

function getSweep(startAngle: number, endAngle: number): number {
  const sweep = normalizeAngle(endAngle - startAngle);
  return Math.abs(sweep) < EPSILON ? 360 : sweep;
}

function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

function polarToCartesian(angle: number, radius: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: CENTER + Math.cos(radians) * radius,
    y: CENTER + Math.sin(radians) * radius,
  };
}

function describeArc(startAngle: number, endAngle: number, radius: number, fullCircle = false): string {
  const rawSweep = normalizeAngle(endAngle - startAngle);
  const sweep = fullCircle && Math.abs(rawSweep) < EPSILON ? 360 : rawSweep;
  if (sweep < EPSILON) return "";

  if (Math.abs(sweep - 360) < EPSILON) {
    const midpoint = startAngle + 180;
    const start = polarToCartesian(startAngle, radius);
    const mid = polarToCartesian(midpoint, radius);
    return [
      `M ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 1 1 ${mid.x} ${mid.y}`,
      `A ${radius} ${radius} 0 1 1 ${start.x} ${start.y}`,
    ].join(" ");
  }

  const start = polarToCartesian(startAngle, radius);
  const end = polarToCartesian(endAngle, radius);
  const largeArcFlag = sweep > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}
