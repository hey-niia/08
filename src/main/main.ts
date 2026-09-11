import { app } from "electron";
import { createPopupWindow } from "./popupWindow";
import { showPopup, startAutoSchedule } from "./scheduler";
import { createTray } from "./tray";

app.whenReady().then(() => {
  if (process.platform === "darwin") {
    app.dock?.hide();
  }

  const popup = createPopupWindow();
  createTray(popup);
  startAutoSchedule(popup);

  // Show herself once shortly after launch, so the app confirms it's alive.
  setTimeout(() => showPopup(popup), 15000);
});

app.on("window-all-closed", () => {
  // The popup window is only ever hidden, never closed — this is a no-op safety net.
  // Intentionally not quitting here: only the tray's Quit does.
});
