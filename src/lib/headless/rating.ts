export interface RatingOptions {
  el: HTMLElement;
  value?: number;
  max?: number;
  readOnly?: boolean;
  onChange?: (value: number) => void;
}

export interface RatingHandle {
  getValue(): number;
  setValue(value: number): void;
  destroy(): void;
}

export function bindRating(options: RatingOptions): RatingHandle {
  const { el, max = 5, readOnly = false, onChange } = options;
  const buttons = Array.from(el.querySelectorAll<HTMLButtonElement>(".rating-star"));
  let value = Math.max(0, Math.min(options.value ?? Number(el.dataset["ratingValue"] ?? 0), max));

  const render = (preview = value) => {
    buttons.forEach((button, index) => {
      const active = index < preview;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    el.setAttribute("aria-valuenow", String(value));
    el.setAttribute("aria-valuetext", `${value} of ${max}`);
  };

  const setValue = (next: number) => {
    value = Math.max(0, Math.min(next, max));
    render();
    onChange?.(value);
  };

  el.setAttribute("role", "slider");
  el.setAttribute("aria-valuemin", "0");
  el.setAttribute("aria-valuemax", String(max));
  if (readOnly) el.setAttribute("aria-readonly", "true");

  buttons.forEach((button, index) => {
    if (readOnly) {
      button.disabled = true;
      return;
    }

    const nextValue = index + 1;
    button.addEventListener("mouseenter", () => render(nextValue));
    button.addEventListener("mouseleave", () => render());
    button.addEventListener("focus", () => render(nextValue));
    button.addEventListener("blur", () => render());
    button.addEventListener("click", () => setValue(nextValue));
  });

  render();

  return {
    getValue() {
      return value;
    },
    setValue,
    destroy() {},
  };
}
