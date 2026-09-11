import { app } from "electron";
import { createPopupWindow } from "./popupWindow";
import { startScheduler } from "./scheduler";
import { createTray } from "./tray";

app.whenReady().then(() => {
  if (process.platform === "darwin") {
    app.dock?.hide();
  }

  const popup = createPopupWindow();
  const triggerPopup = startScheduler(popup);
  createTray(triggerPopup);
});

app.on("window-all-closed", () => {
  // The popup window is only ever hidden, never closed — this is a no-op safety net.
  // Intentionally not quitting here: only the tray's Quit does.
});
