// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bindTooltips } from "../src/lib/headless/tooltip";

function rect(left: number, top: number, width: number, height: number): DOMRect {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  };
}

describe("bindTooltips", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = "";
    Object.defineProperties(window, {
      innerWidth: { value: 1000, configurable: true },
      innerHeight: { value: 600, configurable: true },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("preserves the public anchor attributes while portalling and flipping", () => {
    document.body.innerHTML = `<div style="overflow:hidden"><button id="anchor" data-tooltip="Reset zoom" data-tooltip-placement="right"></button></div>`;
    const anchor = document.getElementById("anchor")!;
    anchor.getBoundingClientRect = () => rect(970, 100, 20, 20);
    const handle = bindTooltips({ root: document, showDelayMs: 0 });
    const tooltip = document.querySelector<HTMLElement>(".tooltip-portal")!;
    tooltip.getBoundingClientRect = () => rect(0, 0, 120, 30);

    anchor.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));

    expect(tooltip.parentElement).toBe(document.body);
    expect(tooltip.dataset.side).toBe("left");
    expect(tooltip.style.left).toBe("842px");
    expect(tooltip.style.top).toBe("95px");
    expect(tooltip.dataset.visible).toBe("true");
    expect(anchor).toHaveProperty("dataset.tooltipVisible", "true");
    expect(anchor).toHaveProperty("dataset.tooltipSide", "left");
    expect(anchor.getAttribute("aria-describedby")).toBe(tooltip.id);
    handle.destroy();
  });

  it("handles tooltip anchors added after binding", () => {
    const handle = bindTooltips({ root: document, showDelayMs: 0 });
    const anchor = document.createElement("button");
    anchor.dataset.tooltip = "Added later";
    anchor.getBoundingClientRect = () => rect(400, 300, 20, 20);
    document.body.append(anchor);
    const tooltip = document.querySelector<HTMLElement>(".tooltip-portal")!;
    tooltip.getBoundingClientRect = () => rect(0, 0, 100, 30);

    anchor.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));

    expect(tooltip.textContent).toBe("Added later");
    expect(tooltip.dataset.visible).toBe("true");
    handle.destroy();
  });

  it("reuses a binding for the same root and fully restores anchors on destroy", () => {
    document.body.innerHTML = `<button id="anchor" data-tooltip="Details" aria-describedby="existing"></button>`;
    const anchor = document.getElementById("anchor")!;
    anchor.getBoundingClientRect = () => rect(400, 300, 20, 20);
    const first = bindTooltips({ root: document, showDelayMs: 0, hideDelayMs: 0 });
    const second = bindTooltips({ root: document });
    const tooltip = document.querySelector<HTMLElement>(".tooltip-portal")!;
    tooltip.getBoundingClientRect = () => rect(0, 0, 100, 30);

    anchor.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    expect(document.querySelectorAll(".tooltip-portal")).toHaveLength(1);
    expect(anchor.getAttribute("aria-describedby")).toContain("existing");
    expect(anchor.getAttribute("aria-describedby")).toContain(tooltip.id);

    first.destroy();
    expect(anchor.getAttribute("aria-describedby")).toBe("existing");
    expect(anchor.dataset.tooltipVisible).toBeUndefined();
    expect(document.querySelector(".tooltip-portal")).toBeNull();
    second.destroy();
  });
});
