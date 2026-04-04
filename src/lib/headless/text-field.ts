export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export interface TextFieldOptions {
  el: HTMLElement;
  validate?: (value: string) => ValidationResult | null;
  validateOn?: "input" | "blur" | "both";
}

export interface TextFieldHandle {
  setError(message?: string): void;
  setSuccess(message?: string): void;
  clearState(): void;
  validate(): boolean;
  destroy(): void;
}

export function bindTextField(options: TextFieldOptions): TextFieldHandle {
  const { el, validate, validateOn = "blur" } = options;

  const input = el.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea");
  if (!input) {
    throw new Error("bindTextField: no input or textarea found inside element");
  }

  const hint = el.querySelector<HTMLElement>(".field-hint");

  function syncHasValue() {
    el.classList.toggle("has-value", input!.value.length > 0);
  }

  function setHint(text: string | undefined) {
    if (!hint) return;
    hint.textContent = text ?? "";
  }

  function setError(message?: string) {
    el.classList.remove("is-success");
    el.classList.add("is-error");
    setHint(message);
  }

  function setSuccess(message?: string) {
    el.classList.remove("is-error");
    el.classList.add("is-success");
    setHint(message);
  }

  function clearState() {
    el.classList.remove("is-error", "is-success");
    setHint(hint?.dataset["default"] ?? "");
  }

  function runValidation(): boolean {
    if (!validate) return true;
    const result = validate(input!.value);
    if (result === null) {
      clearState();
      return true;
    }
    if (result.valid) {
      setSuccess(result.message);
    } else {
      setError(result.message);
    }
    return result.valid;
  }

  // Persist any initial static hint text so clearState can restore it
  if (hint && hint.textContent) {
    hint.dataset["default"] = hint.textContent;
  }

  input.addEventListener("input", syncHasValue);
  syncHasValue();

  if (validate) {
    if (validateOn === "input" || validateOn === "both") {
      input.addEventListener("input", runValidation);
    }
    if (validateOn === "blur" || validateOn === "both") {
      input.addEventListener("blur", runValidation);
    }
  }

  return {
    setError,
    setSuccess,
    clearState,
    validate: runValidation,
    destroy() {
      input.removeEventListener("input", syncHasValue);
      if (validate) {
        input.removeEventListener("input", runValidation);
        input.removeEventListener("blur", runValidation);
      }
    },
  };
}
