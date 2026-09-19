import { app } from "electron";
import { createCat } from "./catManager";
import { createTray } from "./tray";

app.whenReady().then(() => {
  if (process.platform === "darwin") {
    app.dock?.hide();
  }

  createCat();
  createTray();
});

app.on("window-all-closed", () => {
  // The cat window is only ever hidden, never closed — this is a no-op safety net.
  // Intentionally not quitting here: only the tray's Quit does.
});
