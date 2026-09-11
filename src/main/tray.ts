import { app, Menu, nativeImage, Tray } from "electron";
import * as path from "path";

export function createTray(onShowNow: () => void): Tray {
  const iconPath = path.join(__dirname, "../../build/trayTemplate.png");
  const icon = nativeImage.createFromPath(iconPath);
  icon.setTemplateImage(true);

  const tray = new Tray(icon);
  tray.setToolTip("08");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Show 08 now", click: () => onShowNow() },
      { type: "separator" },
      { label: "Quit", click: () => app.quit() },
    ])
  );

  return tray;
}
