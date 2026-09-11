import { BrowserWindow } from "electron";
import * as path from "path";
import { getCornerPosition } from "./positioning";

const WIDTH = 220;
const HEIGHT = 220;

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
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    focusable: false,
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
  win.setIgnoreMouseEvents(true);
  win.loadFile(path.join(__dirname, "../renderer/popup/index.html"));

  return win;
}

export function repositionWindow(win: BrowserWindow): void {
  const [width, height] = win.getSize();
  const { x, y } = getCornerPosition(width, height);
  win.setPosition(x, y);
}
