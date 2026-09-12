import { BrowserWindow } from "electron";
import { createPopupWindow, repositionToCorner } from "./popupWindow";
import { getWalkTrack } from "./positioning";
import { getStayMinutes } from "./settings";
import { CatDef } from "./cats";

const CORNER_POSES = ["sitting", "sleeping", "stretching", "playing"];
// Walking is the flagship behavior (the actual cross-screen run) — make it the default,
// with the quieter corner poses as an occasional accent rather than the common case.
const WALK_PROBABILITY = 0.7;

const WALK_STEP_PX = 6;
const WALK_TICK_MS = 70;
const WALK_FRAME_EVERY_N_TICKS = 2;

export class CatInstance {
  readonly win: BrowserWindow;
  readonly cat: CatDef;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private walkInterval: ReturnType<typeof setInterval> | null = null;
  private walking = false;

  constructor(cat: CatDef) {
    this.cat = cat;
    this.win = createPopupWindow(cat);
  }

  isOut(): boolean {
    return this.win.isVisible() || this.walking;
  }

  /** Auto-schedule or manual "show now" both funnel through here — picks a random action. */
  trigger(): void {
    if (this.isOut()) return;
    if (Math.random() < WALK_PROBABILITY) {
      this.startWalk();
    } else {
      const pose = CORNER_POSES[Math.floor(Math.random() * CORNER_POSES.length)];
      this.showCornerPose(pose);
    }
  }

  hide(): void {
    this.clearHideTimer();
    if (this.walking) this.endWalk();
    else this.win.hide();
  }

  toggle(): void {
    if (this.isOut()) this.hide();
    else this.trigger();
  }

  /** Call after the stay-duration setting changes, to reschedule a currently-visible cat. */
  onDurationChanged(): void {
    if (this.win.isVisible()) this.armHideTimer();
  }

  destroy(): void {
    this.clearHideTimer();
    if (this.walkInterval) clearInterval(this.walkInterval);
    this.win.destroy();
  }

  private clearHideTimer(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  private armHideTimer(): void {
    this.clearHideTimer();
    const minutes = getStayMinutes();
    if (minutes == null) return; // stays until manually hidden
    this.hideTimer = setTimeout(() => this.hide(), minutes * 60 * 1000);
  }

  private showCornerPose(pose: string): void {
    repositionToCorner(this.win);
    this.win.showInactive();
    this.win.webContents.executeJavaScript(`window.__showPose && window.__showPose(${JSON.stringify(pose)})`).catch(() => {});
    this.armHideTimer();
  }

  private startWalk(): void {
    this.walking = true;
    this.win.showInactive();
    this.win.webContents.executeJavaScript("window.__showWalk && window.__showWalk(true)").catch(() => {});
    this.armHideTimer();
    this.runWalkPass();
  }

  /** One crossing of the screen. When it reaches the far edge, loops into another
   * pass from the opposite side — the cat keeps running back and forth until
   * hide()/armHideTimer stops it, instead of vanishing after a single crossing. */
  private runWalkPass(): void {
    const [, height] = this.win.getSize();
    const track = getWalkTrack(height);
    const leftToRight = Math.random() < 0.5;
    let x = leftToRight ? track.leftX : track.rightX;

    this.win.setPosition(Math.round(x), Math.round(track.y));

    let tick = 0;
    let frame = 0;
    const dir = leftToRight ? 1 : -1;

    if (this.walkInterval) clearInterval(this.walkInterval);
    this.walkInterval = setInterval(() => {
      x += WALK_STEP_PX * dir;
      tick++;
      this.win.setPosition(Math.round(x), Math.round(track.y));

      if (tick % WALK_FRAME_EVERY_N_TICKS === 0) {
        frame++;
        this.win.webContents
          .executeJavaScript(`window.__setWalkFrame && window.__setWalkFrame(${frame}, ${leftToRight})`)
          .catch(() => {});
      }

      const reachedEnd = leftToRight ? x >= track.rightX : x <= track.leftX;
      if (reachedEnd) {
        if (this.walkInterval) {
          clearInterval(this.walkInterval);
          this.walkInterval = null;
        }
        if (this.walking) this.runWalkPass();
      }
    }, WALK_TICK_MS);
  }

  private endWalk(): void {
    if (this.walkInterval) {
      clearInterval(this.walkInterval);
      this.walkInterval = null;
    }
    this.walking = false;
    this.win.hide();
  }
}
