export interface TextFieldOptions {
  el: HTMLElement;
}

export interface TextFieldHandle {
  destroy(): void;
}

export function bindTextField(options: TextFieldOptions): TextFieldHandle {
  const { el } = options;

  const input = el.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea");
  if (!input) {
    throw new Error("bindTextField: no input or textarea found inside element");
  }

  function syncHasValue() {
    el.classList.toggle("has-value", input!.value.length > 0);
  }

  input.addEventListener("input", syncHasValue);
  syncHasValue();

  return {
    destroy() {
      input.removeEventListener("input", syncHasValue);
    },
  };
}
