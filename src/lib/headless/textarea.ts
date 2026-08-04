export interface TextareaOptions {
  /** The `<textarea>` element, or a `.textarea-field` container holding one. */
  el: HTMLTextAreaElement | HTMLElement;
  /** Called on every `input` event with the current value. */
  onChange?: (value: string) => void;
}

export interface TextareaHandle {
  getValue(): string;
  setValue(value: string): void;
  destroy(): void;
}

/**
 * Binds auto-resize and optional character-count to a `<textarea>`.
 *
 * Auto-resize: the textarea grows as the user types and never shrinks
 * below its initial `rows` height.
 *
 * Character count: if a `.textarea-count` sibling is present inside the
 * same `.textarea-field` container, it is updated as `n / max` when
 * `maxlength` is set, or just `n` when it is not.
 */
export function bindTextarea(options: TextareaOptions): TextareaHandle {
  const { el, onChange } = options;

  const textarea =
    el instanceof HTMLTextAreaElement
      ? el
      : el.querySelector<HTMLTextAreaElement>("textarea");

  if (!textarea) throw new Error("bindTextarea: no <textarea> found");
  const ta = textarea;

  const container: Element | null = el instanceof HTMLTextAreaElement
    ? el.closest(".textarea-field")
    : el;
  const counter = container?.querySelector<HTMLElement>(".textarea-count") ?? null;

  // Establish the minimum height from the initial rows value
  function getMinHeight(): number {
    const rows = parseInt(ta.getAttribute("rows") ?? "2", 10);
    const style = getComputedStyle(ta);
    const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.4;
    const paddingTop = parseFloat(style.paddingTop);
    const paddingBottom = parseFloat(style.paddingBottom);
    const borderTop = parseFloat(style.borderTopWidth);
    const borderBottom = parseFloat(style.borderBottomWidth);
    return rows * lineHeight + paddingTop + paddingBottom + borderTop + borderBottom;
  }

  function resize() {
    ta.style.height = "0";
    const next = Math.max(ta.scrollHeight, getMinHeight());
    ta.style.height = `${next}px`;
  }

  function updateCounter() {
    if (!counter) return;
    const len = ta.value.length;
    const max = ta.maxLength > 0 ? ta.maxLength : null;
    counter.textContent = max !== null ? `${len} / ${max}` : String(len);
    counter.classList.toggle("is-near-limit", max !== null && len >= max * 0.9);
    counter.classList.toggle("is-at-limit",   max !== null && len >= max);
  }

  function onInput() {
    resize();
    updateCounter();
    onChange?.(ta.value);
  }

  // Prevent newline-driven reflow from showing scrollbar briefly
  ta.style.overflow = "hidden";
  ta.style.resize = "none";
  ta.style.boxSizing = "border-box";

  resize();
  updateCounter();
  ta.addEventListener("input", onInput);

  return {
    getValue: () => ta.value,
    setValue(value: string) {
      ta.value = value;
      resize();
      updateCounter();
      onChange?.(value);
    },
    destroy() {
      ta.removeEventListener("input", onInput);
      ta.style.height = "";
      ta.style.overflow = "";
      ta.style.resize = "";
    },
  };
}
