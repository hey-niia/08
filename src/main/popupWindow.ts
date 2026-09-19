import { BrowserWindow, screen } from "electron";
import * as path from "path";

// Must match the renderer's grid height (L in renderer.ts).
const GRID = 112;

/** A transparent, click-through strip across the middle of the screen that 08 walks along. */
export function createPopupWindow(): BrowserWindow {
  const win = new BrowserWindow({
    ...stripBounds(),
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    hasShadow: false,
    resizable: false,
    movable: false,
    focusable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  win.setIgnoreMouseEvents(true);
  win.setAlwaysOnTop(true, "floating");
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.loadFile(path.join(__dirname, "../renderer/popup/index.html"));
  return win;
}

/** Full work-area width; tall enough for her at a size that reads as "one big cat". */
export function stripBounds(): { x: number; y: number; width: number; height: number } {
  const { workArea } = screen.getPrimaryDisplay();
  const pixel = Math.max(2, Math.round(workArea.height / 165));
  const height = Math.min(workArea.height, GRID * pixel);
  return {
    x: workArea.x,
    y: Math.round(workArea.y + (workArea.height - height) / 2),
    width: workArea.width,
    height,
  };
}
