import { BrowserWindow } from "electron";
import * as path from "path";
import { getCornerPosition } from "./positioning";
import { videoPath } from "./media";

const WIDTH = 400;
const HEIGHT = 300;

export function createPopupWindow(): BrowserWindow {
  const { x, y } = getCornerPosition(WIDTH, HEIGHT);

  const win = new BrowserWindow({
    width: WIDTH,
    height: HEIGHT,
    x,
    y,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    hasShadow: false,
    resizable: false,
    movable: true,
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

  win.setAlwaysOnTop(true, "floating");
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  loadContent(win);

  return win;
}

/** Reloads the page pointing at the current video file — call again if the file changes. */
export function loadContent(win: BrowserWindow): void {
  const current = videoPath();
  const query: Record<string, string> = current ? { video: `file://${current}` } : {};
  win.loadFile(path.join(__dirname, "../renderer/popup/index.html"), { query });
}

export function repositionWindow(win: BrowserWindow): void {
  const [width, height] = win.getSize();
  const { x, y } = getCornerPosition(width, height);
  win.setPosition(x, y);
}
