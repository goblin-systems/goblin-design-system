import { getCurrentWindow } from "@tauri-apps/api/window";

export interface WindowControlOptions {
  minimizeBtnId?: string;
  maximizeBtnId?: string;
  closeBtnId?: string;
}

export function setupWindowControls(options: WindowControlOptions = {}) {
  const {
    minimizeBtnId = "window-minimize-btn",
    maximizeBtnId = "window-maximize-btn",
    closeBtnId = "window-close-btn",
  } = options;

  const win = getCurrentWindow();

  const minimizeBtn = document.getElementById(minimizeBtnId) as HTMLButtonElement | null;
  const maximizeBtn = document.getElementById(maximizeBtnId) as HTMLButtonElement | null;
  const closeBtn = document.getElementById(closeBtnId) as HTMLButtonElement | null;

  minimizeBtn?.addEventListener("click", async () => {
    try {
      await win.minimize();
    } catch (err) {
      console.error("Failed to minimize window:", err);
    }
  });

  if (maximizeBtn) {
    maximizeBtn.addEventListener("click", async () => {
      try {
        const maximized = await win.isMaximized();
        if (maximized) {
          await win.unmaximize();
        } else {
          await win.maximize();
        }
        syncMaximizeIcon(maximizeBtn, !maximized);
      } catch (err) {
        console.error("Failed to toggle maximize:", err);
      }
    });

    // Sync icon on initial load and on window resize
    win.isMaximized().then((maximized) => syncMaximizeIcon(maximizeBtn, maximized)).catch(() => {});
    win.onResized(async () => {
      try {
        const maximized = await win.isMaximized();
        syncMaximizeIcon(maximizeBtn, maximized);
      } catch {
        // ignore
      }
    });
  }

  closeBtn?.addEventListener("click", async () => {
    try {
      await win.close();
    } catch (err) {
      console.error("Failed to close window:", err);
    }
  });
}

/** Swap the maximize button SVG between maximize-2 and minimize-2. */
function syncMaximizeIcon(btn: HTMLButtonElement, isMaximized: boolean) {
  btn.dataset["maximized"] = String(isMaximized);
  const svg = btn.querySelector("svg");
  if (!svg) return;

  // Update the viewBox paths directly — swap the icon by rebuilding from path data
  const use = isMaximized
    ? [
        // minimize-2: two arrows pointing inward
        ["polyline", "points", "4 14 10 14 10 20"],
        ["polyline", "points", "20 10 14 10 14 4"],
        ["line", "x1,y1,x2,y2", "10,20,3,13"],
        ["line", "x1,y1,x2,y2", "21,3,14,10"],
      ]
    : [
        // maximize-2: two arrows pointing outward
        ["polyline", "points", "15 3 21 3 21 9"],
        ["polyline", "points", "9 21 3 21 3 15"],
        ["line", "x1,y1,x2,y2", "21,3,14,10"],
        ["line", "x1,y1,x2,y2", "3,21,10,14"],
      ];

  svg.innerHTML = "";
  const NS = "http://www.w3.org/2000/svg";
  for (const [tag, attrStr, valStr] of use) {
    const el = document.createElementNS(NS, tag as string);
    const attrNames = (attrStr as string).split(",");
    const attrVals = (valStr as string).split(",");
    attrNames.forEach((a, i) => el.setAttribute(a, attrVals[i] ?? ""));
    svg.appendChild(el);
  }
}

export function setupContextMenuGuard() {
  window.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
      event.preventDefault();
    }
  });
}
