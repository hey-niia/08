import { BrowserWindow } from "electron";
import { repositionWindow } from "./popupWindow";
import { getStayMinutes } from "./settings";

/** Fixed for now: how often she checks in on her own, regardless of the stay-duration setting. */
const AUTO_INTERVAL_MS = 5 * 60 * 1000;

let hideTimer: ReturnType<typeof setTimeout> | null = null;

function clearHideTimer(): void {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
}

function armHideTimer(win: BrowserWindow): void {
  clearHideTimer();
  const minutes = getStayMinutes();
  if (minutes == null) return; // stays until manually hidden
  hideTimer = setTimeout(() => hidePopup(win), minutes * 60 * 1000);
}

export function showPopup(win: BrowserWindow): void {
  if (win.isVisible()) return;
  repositionWindow(win);
  win.showInactive();
  win.webContents
    .executeJavaScript("window.__playRandomPose && window.__playRandomPose()")
    .catch(() => {});
  armHideTimer(win);
}

export function hidePopup(win: BrowserWindow): void {
  clearHideTimer();
  win.hide();
}

export function togglePopup(win: BrowserWindow): void {
  if (win.isVisible()) hidePopup(win);
  else showPopup(win);
}

/** Call after the stay-duration setting changes, to reschedule a currently-visible appearance. */
export function onDurationChanged(win: BrowserWindow): void {
  if (win.isVisible()) armHideTimer(win);
}

export function startAutoSchedule(win: BrowserWindow): void {
  setInterval(() => {
    if (!win.isVisible()) showPopup(win);
  }, AUTO_INTERVAL_MS);
}
