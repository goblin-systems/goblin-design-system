# Tauri Helpers

These helpers are only for Tauri desktop applications. Do not use them in web-only apps.

## API

```ts
import {
  setupContextMenuGuard,
  setupWindowControls,
  type WindowControlOptions,
} from "@goblin-systems/goblin-design-system";

setupWindowControls({
  minimizeBtnId: "window-minimize-btn",
  maximizeBtnId: "window-maximize-btn",
  closeBtnId: "window-close-btn",
});

setupContextMenuGuard();
```

- `setupWindowControls(options)` — wires minimize, maximize, and close buttons to Tauri window commands
- `setupContextMenuGuard()` — disables right-click and keyboard context-menu shortcuts globally

## Window Shell Markup

See `navigation.md` → Window Shell for the corresponding HTML markup.
