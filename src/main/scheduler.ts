import { BrowserWindow } from "electron";
import { repositionWindow } from "./popupWindow";

const INTERVAL_MS = 3 * 60 * 1000;
const FADE_MS = 800;
const HOLD_MS = 9000;
const TOTAL_VISIBLE_MS = FADE_MS + HOLD_MS + FADE_MS;

let hideTimer: ReturnType<typeof setTimeout> | null = null;

export function startScheduler(win: BrowserWindow): () => void {
  const triggerPopup = () => {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
      win.hide();
    }
    repositionWindow(win);
    win.showInactive();
    win.webContents
      .executeJavaScript("window.__playRandomPose && window.__playRandomPose()")
      .catch(() => {});
    hideTimer = setTimeout(() => {
      win.hide();
      hideTimer = null;
    }, TOTAL_VISIBLE_MS);
  };

  // Show herself once shortly after launch, so the app confirms it's alive.
  setTimeout(triggerPopup, 15000);
  setInterval(triggerPopup, INTERVAL_MS);

  return triggerPopup;
}
