import { app, Menu, nativeImage, Tray } from "electron";
import * as path from "path";
import { isOut, toggle, onDurationChanged, restartSchedule, getWindow } from "./catManager";
import { getStayMinutes, setStayMinutes, getShowEveryMinutes, setShowEveryMinutes } from "./settings";

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

function buildMenu(): Menu {
  const currentStay = getStayMinutes();
  const currentFrequency = getShowEveryMinutes();

  return Menu.buildFromTemplate([
    { label: isOut() ? "Hide" : "Show now", click: () => toggle() },
    { type: "separator" },
    {
      label: "Show every",
      submenu: FREQUENCY_OPTIONS.map(({ label, minutes }) => ({
        label,
        type: "radio",
        checked: currentFrequency === minutes,
        click: () => {
          setShowEveryMinutes(minutes);
          restartSchedule();
        },
      })),
    },
    {
      label: "Break length",
      submenu: STAY_OPTIONS.map(({ label, minutes }) => ({
        label,
        type: "radio",
        checked: currentStay === minutes,
        click: () => {
          setStayMinutes(minutes);
          onDurationChanged();
        },
      })),
    },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]);
}

function trayIconPath(): string {
  // Packaged builds only ship dist/**/* inside the app — the source-tree build/
  // folder isn't there, so the tray PNG is copied in separately as an extraResource.
  return app.isPackaged
    ? path.join(process.resourcesPath, "trayTemplate.png")
    : path.join(__dirname, "../../build/trayTemplate.png");
}

export function createTray(): Tray {
  const icon = nativeImage.createFromPath(trayIconPath());
  icon.setTemplateImage(true);

  tray = new Tray(icon);
  tray.setToolTip("08");

  const refresh = () => tray?.setContextMenu(buildMenu());

  const win = getWindow();
  win?.on("show", refresh);
  win?.on("hide", refresh);
  refresh();

  return tray;
}
