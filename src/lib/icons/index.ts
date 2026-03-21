/**
 * Goblin icon library — powered by Lucide (ISC license).
 * https://lucide.dev
 *
 * Usage in HTML:  <i data-lucide="search"></i>
 * Usage in JS:    createIcon("search")  → returns an SVGElement
 *
 * Call applyIcons() once after the DOM is ready (or after injecting new HTML)
 * to replace all <i data-lucide="..."> elements with inline SVG.
 */

import * as _lucide from "lucide";
import { createIcons, type IconNode } from "lucide";

// Build the full icon set by filtering for icon nodes (arrays of child tuples).
// This picks up all ~1900+ icons without manual enumeration.
export const ICON_SET: Record<string, IconNode> = Object.fromEntries(
  Object.entries(_lucide).filter(([, v]) => Array.isArray(v))
) as Record<string, IconNode>;

/**
 * Replace all `<i data-lucide="icon-name">` elements in the document with
 * inline SVG. Call this once after the DOM is ready, and again after any
 * dynamically injected HTML that contains icon placeholders.
 *
 * Icon names use kebab-case (e.g. "chevron-left", "sliders-horizontal").
 */
export function applyIcons() {
  createIcons({ icons: ICON_SET });
}

/**
 * Create a single lucide icon as an SVGElement by kebab-case name.
 * Useful when building HTML programmatically in TypeScript.
 *
 * @example
 *   const svg = createIcon("search");
 *   if (svg) btn.prepend(svg);
 */
export function createIcon(name: string): SVGSVGElement | null {
  // Convert kebab-case → PascalCase to look up in ICON_SET
  const key = name
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");

  const iconNode = ICON_SET[key];
  if (!iconNode) return null;

  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg") as SVGSVGElement;
  svg.setAttribute("xmlns", NS);
  svg.setAttribute("width", "24");
  svg.setAttribute("height", "24");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");

  // IconNode = Array of [tag, attrs] child element tuples
  for (const [tag, attrs] of iconNode) {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs as Record<string, unknown>)) {
      el.setAttribute(k, String(v));
    }
    svg.appendChild(el);
  }

  return svg;
}

export { type IconNode };
