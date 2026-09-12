import { BrowserWindow } from "electron";
import { repositionWindow } from "./popupWindow";
import { getStayMinutes, getShowEveryMinutes } from "./settings";

let hideTimer: ReturnType<typeof setTimeout> | null = null;
let autoInterval: ReturnType<typeof setInterval> | null = null;

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

/** (Re)starts the auto-appear interval from the current show-every setting. Safe to call anytime the setting changes. */
export function restartAutoSchedule(win: BrowserWindow): void {
  if (autoInterval) {
    clearInterval(autoInterval);
    autoInterval = null;
  }
  const minutes = getShowEveryMinutes();
  if (minutes == null) return; // manual only
  autoInterval = setInterval(() => {
    if (!win.isVisible()) showPopup(win);
  }, minutes * 60 * 1000);
}
