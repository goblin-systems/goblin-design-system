export interface SplitPaneOptions {
  /** The grid workspace element. */
  workspace: HTMLElement;
  /** The resizer element for the left split. */
  leftResizer: HTMLElement;
  /** The resizer element for the right split. */
  rightResizer: HTMLElement;
  /** CSS variable name for left panel width. Default "--left-panel-width". */
  leftVar?: string;
  /** CSS variable name for right panel width. Default "--right-panel-width". */
  rightVar?: string;
  minLeft?: number;
  maxLeft?: number;
  minRight?: number;
  maxRight?: number;
}

export function bindSplitPaneResize(options: SplitPaneOptions) {
  const {
    workspace,
    leftResizer,
    rightResizer,
    leftVar = "--left-panel-width",
    rightVar = "--right-panel-width",
    minLeft = 160,
    maxLeft = 480,
    minRight = 160,
    maxRight = 520,
  } = options;

  let dragging: "left" | "right" | null = null;
  let startX = 0;
  let startWidth = 0;

  function currentLeft() {
    return parseInt(getComputedStyle(workspace).getPropertyValue(leftVar) || "220", 10);
  }

  function currentRight() {
    return parseInt(getComputedStyle(workspace).getPropertyValue(rightVar) || "260", 10);
  }

  leftResizer.addEventListener("mousedown", (e: MouseEvent) => {
    dragging = "left";
    startX = e.clientX;
    startWidth = currentLeft();
    e.preventDefault();
  });

  rightResizer.addEventListener("mousedown", (e: MouseEvent) => {
    dragging = "right";
    startX = e.clientX;
    startWidth = currentRight();
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e: MouseEvent) => {
    if (!dragging) return;

    if (dragging === "left") {
      const delta = e.clientX - startX;
      const next = Math.min(maxLeft, Math.max(minLeft, startWidth + delta));
      workspace.style.setProperty(leftVar, `${next}px`);
    } else {
      const delta = startX - e.clientX;
      const next = Math.min(maxRight, Math.max(minRight, startWidth + delta));
      workspace.style.setProperty(rightVar, `${next}px`);
    }
  });

  document.addEventListener("mouseup", () => {
    dragging = null;
  });
}
