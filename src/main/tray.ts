import { app, BrowserWindow, Menu, nativeImage, Tray } from "electron";
import * as path from "path";
import { togglePopup, onDurationChanged, restartAutoSchedule } from "./scheduler";
import {
  getStayMinutes,
  setStayMinutes,
  getShowEveryMinutes,
  setShowEveryMinutes,
} from "./settings";

let tray: Tray | null = null;

const STAY_OPTIONS: { label: string; minutes: number | null }[] = [
  { label: "1 minute", minutes: 1 },
  { label: "3 minutes", minutes: 3 },
  { label: "5 minutes", minutes: 5 },
  { label: "10 minutes", minutes: 10 },
  { label: "15 minutes", minutes: 15 },
  { label: "Until I hide her", minutes: null },
];

const FREQUENCY_OPTIONS: { label: string; minutes: number | null }[] = [
  { label: "Every 5 minutes", minutes: 5 },
  { label: "Every 15 minutes", minutes: 15 },
  { label: "Every 25 minutes", minutes: 25 },
  { label: "Every 50 minutes", minutes: 50 },
  { label: "Off — manual only", minutes: null },
];

function buildMenu(win: BrowserWindow): Menu {
  const currentStay = getStayMinutes();
  const currentFrequency = getShowEveryMinutes();

  return Menu.buildFromTemplate([
    { label: win.isVisible() ? "Hide" : "Show 08 now", click: () => togglePopup(win) },
    { type: "separator" },
    {
      label: "Show every",
      submenu: FREQUENCY_OPTIONS.map(({ label, minutes }) => ({
        label,
        type: "radio",
        checked: currentFrequency === minutes,
        click: () => {
          setShowEveryMinutes(minutes);
          restartAutoSchedule(win);
        },
      })),
    },
    {
      label: "Stay on screen",
      submenu: STAY_OPTIONS.map(({ label, minutes }) => ({
        label,
        type: "radio",
        checked: currentStay === minutes,
        click: () => {
          setStayMinutes(minutes);
          onDurationChanged(win);
        },
      })),
    },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]);
}

export function createTray(win: BrowserWindow): Tray {
  const iconPath = path.join(__dirname, "../../build/trayTemplate.png");
  const icon = nativeImage.createFromPath(iconPath);
  icon.setTemplateImage(true);

  tray = new Tray(icon);
  tray.setToolTip("08");
  tray.setContextMenu(buildMenu(win));

  const refresh = () => tray?.setContextMenu(buildMenu(win));
  win.on("show", refresh);
  win.on("hide", refresh);

  return tray;
}
