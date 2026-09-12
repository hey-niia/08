import { BrowserWindow } from "electron";
import { createPopupWindow, repositionToCorner } from "./popupWindow";
import { randomRoamPoint } from "./positioning";
import { getStayMinutes } from "./settings";
import { CatDef } from "./cats";

const CORNER_POSES = ["sitting", "sleeping", "stretching", "playing"];
// Walking is the flagship behavior (the actual cross-screen run) — make it the default,
// with the quieter corner poses as an occasional accent rather than the common case.
const WALK_PROBABILITY = 0.7;

const WALK_STEP_PX = 6;
const WALK_TICK_MS = 70;
const WALK_FRAME_EVERY_N_TICKS = 2;
const ROAM_PAUSE_MIN_MS = 400;
const ROAM_PAUSE_MAX_MS = 1600;

export class CatInstance {
  readonly win: BrowserWindow;
  readonly cat: CatDef;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private walkInterval: ReturnType<typeof setInterval> | null = null;
  private roamPauseTimer: ReturnType<typeof setTimeout> | null = null;
  private walking = false;
  private facingRight = false;

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
    this.clearRoamPauseTimer();
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
    const [width, height] = this.win.getSize();
    const start = randomRoamPoint(width, height);
    this.win.setPosition(Math.round(start.x), Math.round(start.y));
    this.win.showInactive();
    this.win.webContents.executeJavaScript("window.__showWalk && window.__showWalk(true)").catch(() => {});
    this.armHideTimer();
    this.roamToNewTarget();
  }

  /** Picks a random point anywhere on screen and walks to it; on arrival, pauses
   * briefly like a cat deciding where to go next, then picks another — repeats
   * until hide()/armHideTimer stops it, so it wanders freely instead of pacing
   * a fixed line. */
  private roamToNewTarget(): void {
    if (!this.walking) return;
    const [width, height] = this.win.getSize();
    const target = randomRoamPoint(width, height);
    let tick = 0;
    let frame = 0;

    if (this.walkInterval) clearInterval(this.walkInterval);
    this.walkInterval = setInterval(() => {
      const [curX, curY] = this.win.getPosition();
      const dx = target.x - curX;
      const dy = target.y - curY;
      const dist = Math.hypot(dx, dy);

      if (dist <= WALK_STEP_PX) {
        if (this.walkInterval) {
          clearInterval(this.walkInterval);
          this.walkInterval = null;
        }
        if (this.walking) {
          const pause = ROAM_PAUSE_MIN_MS + Math.random() * (ROAM_PAUSE_MAX_MS - ROAM_PAUSE_MIN_MS);
          this.roamPauseTimer = setTimeout(() => this.roamToNewTarget(), pause);
        }
        return;
      }

      this.win.setPosition(Math.round(curX + (dx / dist) * WALK_STEP_PX), Math.round(curY + (dy / dist) * WALK_STEP_PX));

      tick++;
      if (tick % WALK_FRAME_EVERY_N_TICKS === 0) {
        frame++;
        if (Math.abs(dx) > 1) this.facingRight = dx > 0;
        this.win.webContents
          .executeJavaScript(`window.__setWalkFrame && window.__setWalkFrame(${frame}, ${this.facingRight})`)
          .catch(() => {});
      }
    }, WALK_TICK_MS);
  }

  private clearRoamPauseTimer(): void {
    if (this.roamPauseTimer) {
      clearTimeout(this.roamPauseTimer);
      this.roamPauseTimer = null;
    }
  }

  private endWalk(): void {
    if (this.walkInterval) {
      clearInterval(this.walkInterval);
      this.walkInterval = null;
    }
    this.clearRoamPauseTimer();
    this.walking = false;
    this.win.hide();
  }
}
