import { app, BrowserWindow, Menu, nativeImage, shell, Tray } from "electron";
import * as path from "path";
import { togglePopup, onDurationChanged } from "./scheduler";
import { getStayMinutes, setStayMinutes } from "./settings";
import { ensureVideoDir, videoDir, hasVideo } from "./media";
import { loadContent } from "./popupWindow";

let tray: Tray | null = null;

const DURATION_OPTIONS: { label: string; minutes: number | null }[] = [
  { label: "1 minute", minutes: 1 },
  { label: "3 minutes", minutes: 3 },
  { label: "5 minutes", minutes: 5 },
  { label: "10 minutes", minutes: 10 },
  { label: "15 minutes", minutes: 15 },
  { label: "Until I hide her", minutes: null },
];

function buildMenu(win: BrowserWindow): Menu {
  const current = getStayMinutes();

  return Menu.buildFromTemplate([
    { label: win.isVisible() ? "Hide" : "Show 08 now", click: () => togglePopup(win) },
    { type: "separator" },
    {
      label: "Stay on screen",
      submenu: DURATION_OPTIONS.map(({ label, minutes }) => ({
        label,
        type: "radio",
        checked: current === minutes,
        click: () => {
          setStayMinutes(minutes);
          onDurationChanged(win);
        },
      })),
    },
    { type: "separator" },
    {
      label: hasVideo() ? "Replace cat video…" : "Add cat video…",
      click: () => {
        ensureVideoDir();
        shell.openPath(videoDir());
      },
    },
    {
      label: "Reload video",
      click: () => loadContent(win),
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
