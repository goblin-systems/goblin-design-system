/** Resolve a required element by id. Throws if missing. */
export function byId<T extends HTMLElement>(id: string, doc: Document = document): T {
  const el = doc.getElementById(id);
  if (!el) throw new Error(`Missing required element: #${id}`);
  return el as T;
}

/** Resolve an optional element by id. Returns null if missing. */
export function byIdOptional<T extends HTMLElement>(
  id: string,
  doc: Document = document
): T | null {
  return (doc.getElementById(id) as T | null) ?? null;
}

/** Resolve a required element by CSS selector. Throws if missing. */
export function qs<T extends HTMLElement>(selector: string, root: ParentNode = document): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`Missing required element: ${selector}`);
  return el;
}

/** Resolve all elements matching a CSS selector. */
export function qsAll<T extends HTMLElement>(
  selector: string,
  root: ParentNode = document
): NodeListOf<T> {
  return root.querySelectorAll<T>(selector);
}

/** Populate a <select> with string options. Disables it when the list is empty. */
export function populateSelectOptions(
  select: HTMLSelectElement,
  options: string[],
  preferred: string
) {
  select.innerHTML = "";

  if (options.length === 0) {
    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = "No options available";
    select.appendChild(empty);
    select.value = "";
    select.disabled = true;
    return;
  }

  for (const value of options) {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = value;
    select.appendChild(opt);
  }

  select.disabled = false;
  select.value = options.includes(preferred) ? preferred : options[0]!;
}

/** Toggle the disabled+opacity state of a container and its interactive children. */
export function setGroupDisabled(container: HTMLElement, disabled: boolean) {
  container.classList.toggle("is-disabled", disabled);
  container
    .querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>(
      "input, select, button"
    )
    .forEach((el) => {
      el.disabled = disabled;
    });
}
