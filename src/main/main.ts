import { app } from "electron";
import { rebuildCats } from "./catManager";
import { createTray } from "./tray";

app.whenReady().then(() => {
  if (process.platform === "darwin") {
    app.dock?.hide();
  }

  rebuildCats();
  createTray();
});

app.on("window-all-closed", () => {
  // Cat windows are only ever hidden, never closed — this is a no-op safety net.
  // Intentionally not quitting here: only the tray's Quit does.
});
