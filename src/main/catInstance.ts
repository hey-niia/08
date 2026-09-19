import { BrowserWindow } from "electron";
import { createPopupWindow, stripBounds } from "./popupWindow";
import { getStayMinutes } from "./settings";

// If the renderer never reports she's gone (e.g. it crashed), hide the window anyway.
const LEAVE_FALLBACK_MS = 30000;

/** 08: walks in, sits for the break, walks off. The walk/sit itself runs in the renderer. */
export class CatInstance {
  readonly win: BrowserWindow;
  private out = false;
  private fallback: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.win = createPopupWindow();
    // The renderer sets its title to "gone" once she has walked off screen.
    this.win.webContents.on("page-title-updated", (_e, title) => {
      if (title === "gone") this.finish();
    });
  }

  isOut(): boolean {
    return this.out;
  }

  /** Scheduled break or manual "Show now". */
  trigger(): void {
    if (this.out) return;
    this.out = true;
    this.win.setBounds(stripBounds());
    this.win.showInactive();
    this.run(`window.__start && window.__start(${stayMs()})`);
  }

  /** She gets up and walks off; the window hides once she's gone. */
  hide(): void {
    if (!this.out) return;
    this.run("window.__leave && window.__leave()");
    if (this.fallback) clearTimeout(this.fallback);
    this.fallback = setTimeout(() => this.finish(), LEAVE_FALLBACK_MS);
  }

  toggle(): void {
    if (this.out) this.hide();
    else this.trigger();
  }

  /** Call after the stay-duration setting changes, so a cat already out uses the new length. */
  onDurationChanged(): void {
    if (this.out) this.run(`window.__setStay && window.__setStay(${stayMs()})`);
  }

  destroy(): void {
    if (this.fallback) clearTimeout(this.fallback);
    this.win.destroy();
  }

  private finish(): void {
    if (this.fallback) clearTimeout(this.fallback);
    this.fallback = null;
    this.out = false;
    this.win.hide();
  }

  private run(js: string): void {
    this.win.webContents.executeJavaScript(js).catch(() => {});
  }
}

function stayMs(): string {
  const minutes = getStayMinutes();
  return minutes == null ? "null" : String(minutes * 60 * 1000);
}
