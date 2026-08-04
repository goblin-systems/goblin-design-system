export interface NumberInputOptions {
  /** The `.number-input` container element. */
  el: HTMLElement;
  /** Called whenever the value changes. */
  onChange?: (value: number) => void;
}

export interface NumberInputHandle {
  getValue(): number;
  setValue(value: number): void;
  destroy(): void;
}

/**
 * Wires the +/− buttons inside a `.number-input` container to the
 * enclosed `<input type="number">`. Respects `min`, `max`, and `step`
 * attributes. Disables each button when the value is at its boundary.
 */
export function bindNumberInput(options: NumberInputOptions): NumberInputHandle {
  const { el, onChange } = options;

  const input = el.querySelector<HTMLInputElement>("input[type='number']");
  const decBtn = el.querySelector<HTMLButtonElement>(".number-input-dec");
  const incBtn = el.querySelector<HTMLButtonElement>(".number-input-inc");

  if (!input) throw new Error("bindNumberInput: no <input type='number'> found inside el");
  const inp = input;

  function getMin() { return inp.min !== "" ? parseFloat(inp.min) : -Infinity; }
  function getMax() { return inp.max !== "" ? parseFloat(inp.max) :  Infinity; }
  function getStep() { return inp.step !== "" && inp.step !== "any" ? parseFloat(inp.step) : 1; }

  function clamp(v: number) {
    return Math.min(getMax(), Math.max(getMin(), v));
  }

  function round(v: number, step: number) {
    // Avoid floating-point drift (e.g. 0.1 + 0.2 = 0.30000000000000004)
    const decimals = (step.toString().split(".")[1] ?? "").length;
    return parseFloat(v.toFixed(decimals));
  }

  function syncButtons(v: number) {
    if (decBtn) decBtn.disabled = v <= getMin();
    if (incBtn) incBtn.disabled = v >= getMax();
  }

  function setValue(value: number) {
    const clamped = round(clamp(value), getStep());
    inp.value = String(clamped);
    syncButtons(clamped);
  }

  function getValue() {
    return parseFloat(inp.value) || 0;
  }

  function step(dir: 1 | -1) {
    setValue(round(getValue() + dir * getStep(), getStep()));
    onChange?.(getValue());
  }

  const onDec = () => step(-1);
  const onInc = () => step(1);

  function onInput() {
    const v = parseFloat(inp.value);
    if (!isNaN(v)) {
      syncButtons(clamp(v));
      onChange?.(clamp(v));
    }
  }

  decBtn?.addEventListener("click", onDec);
  incBtn?.addEventListener("click", onInc);
  inp.addEventListener("input", onInput);

  // Initial boundary sync
  syncButtons(getValue());

  return {
    getValue,
    setValue(value: number) {
      setValue(value);
      onChange?.(getValue());
    },
    destroy() {
      decBtn?.removeEventListener("click", onDec);
      incBtn?.removeEventListener("click", onInc);
      inp.removeEventListener("input", onInput);
    },
  };
}
