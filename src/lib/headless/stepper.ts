export type StepState = "pending" | "active" | "complete" | "error";

export interface StepperOptions {
  /** The `.stepper` container element. */
  el: HTMLElement;
  /** Initial step index (0-based). Default 0. */
  currentStep?: number;
  /** Called when the active step changes. */
  onChange?: (index: number, state: StepState) => void;
}

export interface StepperHandle {
  setStep(index: number): void;
  setStepState(index: number, state: StepState): void;
  getStep(): number;
  next(): void;
  prev(): void;
  destroy(): void;
}

const CHECK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
const X_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

export function bindStepper(options: StepperOptions): StepperHandle {
  const { el, onChange } = options;

  const steps = Array.from(el.querySelectorAll<HTMLElement>(":scope > .step"));
  const states: StepState[] = steps.map((s) => {
    if (s.classList.contains("step-active")) return "active";
    if (s.classList.contains("step-complete")) return "complete";
    if (s.classList.contains("step-error")) return "error";
    return "pending";
  });

  let current = options.currentStep ?? states.findIndex((s) => s === "active");
  if (current < 0) current = 0;

  function applyState(index: number, state: StepState) {
    const step = steps[index];
    if (!step) return;
    states[index] = state;
    step.classList.remove("step-active", "step-complete", "step-error");
    if (state !== "pending") step.classList.add(`step-${state}`);

    const indicator = step.querySelector<HTMLElement>(".step-indicator");
    if (indicator) {
      if (state === "complete") {
        indicator.innerHTML = CHECK_SVG;
      } else if (state === "error") {
        indicator.innerHTML = X_SVG;
      } else {
        indicator.textContent = String(index + 1);
      }
    }

    step.setAttribute("aria-current", state === "active" ? "step" : "false");
  }

  function setStep(index: number) {
    if (index < 0 || index >= steps.length) return;
    steps.forEach((_, i) => {
      if (i < index) applyState(i, "complete");
      else if (i === index) applyState(i, "active");
      else applyState(i, "pending");
    });
    current = index;
    onChange?.(current, "active");
  }

  function setStepState(index: number, state: StepState) {
    applyState(index, state);
    if (state === "active") current = index;
    onChange?.(index, state);
  }

  // Preserve authored state mix when no explicit current step is provided.
  if (options.currentStep === undefined && states.some((state) => state === "error" || state === "complete")) {
    states.forEach((state, index) => applyState(index, state));
  } else {
    setStep(current);
  }

  return {
    setStep,
    setStepState,
    getStep: () => current,
    next() { setStep(Math.min(current + 1, steps.length - 1)); },
    prev() { setStep(Math.max(current - 1, 0)); },
    destroy() {},
  };
}
