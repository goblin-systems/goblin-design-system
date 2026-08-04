export interface DropZoneOptions {
  /** The `.drop-zone` container element. */
  el: HTMLElement;
  /** Called when files are dropped or selected via browse (HTML5 path). */
  onDrop: (files: FileList) => void;
  /**
   * Called when files are dropped via Tauri's native OS drag-drop event.
   * Receives an array of absolute file-system paths.
   *
   * Required for file-drop to work in Tauri v2 apps on Windows. By default
   * Tauri intercepts OS-level drags (`dragDropEnabled: true`), which prevents
   * `dataTransfer.files` from being populated in HTML5 drag events. Provide
   * this callback to receive paths via `Webview.onDragDropEvent()` instead.
   *
   * To use `onDrop` (HTML5) instead, set `dragDropEnabled: false` on the
   * Tauri webview — but that must be configured at the app level.
   */
  onDropPaths?: (paths: string[]) => void;
  /**
   * Accepted MIME types (e.g. `"image/*"`, `"application/json"`).
   * Also applied as the `accept` attribute on the hidden file input.
   * If omitted, all files are accepted.
   */
  accept?: string;
  /** Allow selecting multiple files. Default true. */
  multiple?: boolean;
}

export interface DropZoneHandle {
  /** Programmatically open the file browser. */
  browse(): void;
  destroy(): void;
}

/**
 * Wires drag-and-drop and click-to-browse file selection to a `.drop-zone`
 * element. Returns a handle with `browse()` and `destroy()`.
 *
 * In Tauri v2 apps, OS-level file drags do not populate `dataTransfer.files`
 * (Tauri intercepts them). Provide `onDropPaths` to receive file paths via
 * `Webview.onDragDropEvent()` instead.
 */
export function bindDropZone(options: DropZoneOptions): DropZoneHandle {
  const { el, onDrop: emitDrop, onDropPaths, accept, multiple = true } = options;

  // Hidden file input for the click-to-browse path
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.tabIndex = -1;
  fileInput.setAttribute("aria-hidden", "true");
  fileInput.style.cssText =
    "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;";
  if (accept) fileInput.accept = accept;
  if (multiple) fileInput.multiple = true;
  el.appendChild(fileInput);

  let dragCounter = 0; // track nested dragenter/dragleave

  function isAccepted(file: File): boolean {
    if (!accept) return true;
    return accept.split(",").some((type) => {
      const t = type.trim();
      if (t.endsWith("/*")) return file.type.startsWith(t.slice(0, -1));
      return file.type === t || file.name.endsWith(t.replace("*", ""));
    });
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    emitDrop(files);
  }

  const onDragEnter = (e: DragEvent) => {
    e.preventDefault();
    dragCounter++;
    el.classList.add("is-dragging-over");
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
  };

  const onDragLeave = () => {
    dragCounter--;
    if (dragCounter === 0) el.classList.remove("is-dragging-over");
  };

  const onDropEvent = (e: DragEvent) => {
    e.preventDefault();
    dragCounter = 0;
    el.classList.remove("is-dragging-over");
    const files = e.dataTransfer?.files ?? null;
    if (files) {
      const accepted = accept
        ? Array.from(files).filter(isAccepted)
        : Array.from(files);
      if (accepted.length > 0) {
        const dt = new DataTransfer();
        accepted.forEach((f) => dt.items.add(f));
        handleFiles(dt.files);
      }
    }
  };

  const onFileInputChange = () => handleFiles(fileInput.files);

  const onClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".drop-zone-browse") || target === el) {
      fileInput.value = "";
      fileInput.click();
    }
  };

  el.addEventListener("dragenter", onDragEnter);
  el.addEventListener("dragover", onDragOver);
  el.addEventListener("dragleave", onDragLeave);
  el.addEventListener("drop", onDropEvent);
  el.addEventListener("click", onClick);
  fileInput.addEventListener("change", onFileInputChange);

  // ── Tauri v2 native OS drag-drop ──────────────────────────────────────────
  // In Tauri v2, `dragDropEnabled` defaults to true, which causes Tauri to
  // intercept OS-level file drags before they reach the HTML5 event system.
  // onDragDropEvent() or direct event.listen() is required to receive them.
  type TauriUnlisten = () => void;
  const tauriUnlisteners: TauriUnlisten[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tauri = (window as any).__TAURI__;
  if (tauri && onDropPaths) {
    // Tauri gives physical pixel coords; getBoundingClientRect() is CSS pixels.
    function isOverEl(pos: { x: number; y: number } | undefined): boolean {
      if (!pos) return false;
      const dpr = window.devicePixelRatio || 1;
      const cssX = pos.x / dpr;
      const cssY = pos.y / dpr;
      const r = el.getBoundingClientRect();
      return cssX >= r.left && cssX <= r.right && cssY >= r.top && cssY <= r.bottom;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleDragDropEvent(payload: any) {
      const pos = payload.position;
      switch (payload.type) {
        case "enter":
        case "over":
          el.classList.toggle("is-dragging-over", isOverEl(pos));
          break;
        case "leave":
          el.classList.remove("is-dragging-over");
          break;
        case "drop": {
          el.classList.remove("is-dragging-over");
          if (isOverEl(pos)) {
            const paths: string[] = payload.paths ?? [];
            if (paths.length > 0) onDropPaths!(paths);
          }
          break;
        }
      }
    }

    // Preferred: webview-scoped API (Tauri v2, @tauri-apps/api/webview)
    const tauriWebview = tauri.webview?.getCurrentWebview?.();
    if (tauriWebview?.onDragDropEvent) {
      tauriWebview
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .onDragDropEvent((event: any) => handleDragDropEvent(event.payload ?? {}))
        .then((fn: TauriUnlisten) => tauriUnlisteners.push(fn))
        .catch((err: unknown) => console.warn("[DropZone] onDragDropEvent failed:", err));
    } else if (tauri.event?.listen) {
      // Fallback: global event bus — works when webview module isn't exposed.
      // Raw payload: { paths: string[], position: { x, y } } (physical pixels)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wrapGlobal = (type: string) => (event: any) =>
        handleDragDropEvent({ type, paths: event.payload?.paths, position: event.payload?.position });
      const listenFn = tauri.event.listen as (
        e: string,
        h: (ev: unknown) => void
      ) => Promise<TauriUnlisten>;
      Promise.all([
        listenFn("tauri://drag-enter", wrapGlobal("enter")),
        listenFn("tauri://drag-over", wrapGlobal("over")),
        listenFn("tauri://drag-drop", wrapGlobal("drop")),
        listenFn("tauri://drag-leave", wrapGlobal("leave")),
      ])
        .then((fns) => tauriUnlisteners.push(...fns))
        .catch((err: unknown) => console.warn("[DropZone] event.listen failed:", err));
    } else {
      console.warn("[DropZone] window.__TAURI__ found but no event API available");
    }
  }

  return {
    browse() {
      fileInput.value = "";
      fileInput.click();
    },
    destroy() {
      el.removeEventListener("dragenter", onDragEnter);
      el.removeEventListener("dragover", onDragOver);
      el.removeEventListener("dragleave", onDragLeave);
      el.removeEventListener("drop", onDropEvent);
      el.removeEventListener("click", onClick);
      fileInput.removeEventListener("change", onFileInputChange);
      fileInput.remove();
      el.classList.remove("is-dragging-over");
      tauriUnlisteners.forEach((fn) => fn());
    },
  };
}
