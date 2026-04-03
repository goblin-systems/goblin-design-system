export interface SwitchOptions {
  /** The `.switch` container element (must contain an `input[type="checkbox"]`). */
  el: HTMLElement;
  /** Initial checked state. Defaults to the checkbox's current state. */
  value?: boolean;
  /** Called whenever the switch value changes. */
  onChange?: (checked: boolean) => void;
}

export interface SwitchHandle {
  getValue(): boolean;
  setValue(checked: boolean): void;
  destroy(): void;
}

export function bindSwitch(options: SwitchOptions): SwitchHandle {
  const { el, onChange } = options;

  const input = el.querySelector<HTMLInputElement>("input[type='checkbox']");
  if (!input) throw new Error("bindSwitch: no input[type='checkbox'] found inside element");

  const track = el.querySelector<HTMLElement>(".switch-track");
  input.setAttribute("role", "switch");
  input.setAttribute("aria-checked", String(input.checked));

  if (options.value !== undefined) {
    input.checked = options.value;
    input.setAttribute("aria-checked", String(options.value));
  }

  const onInputChange = () => {
    input.setAttribute("aria-checked", String(input.checked));
    onChange?.(input.checked);
  };

  input.addEventListener("change", onInputChange);

  return {
    getValue: () => input.checked,
    setValue(checked: boolean) {
      input.checked = checked;
      input.setAttribute("aria-checked", String(checked));
    },
    destroy() {
      input.removeEventListener("change", onInputChange);
      track?.removeAttribute("tabindex");
    },
  };
}
