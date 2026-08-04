/**
 * Observes size changes on `el` and calls `callback` with the new content-box
 * dimensions. Returns a stop function that disconnects the observer.
 *
 * ```ts
 * const stop = bindResizeObserver(canvasEl, (width, height) => {
 *   canvas.width = width;
 *   redraw();
 * });
 * // later:
 * stop();
 * ```
 */
export function bindResizeObserver(
  el: Element,
  callback: (width: number, height: number) => void,
): () => void {
  const ro = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (!entry) return;
    const { width, height } = entry.contentRect;
    callback(width, height);
  });
  ro.observe(el);
  return () => ro.disconnect();
}
