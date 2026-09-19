import { CatInstance } from "./catInstance";
import { getShowEveryMinutes } from "./settings";

let cat: CatInstance | null = null;
let stopSchedule: () => void = () => {};

export function getWindow() {
  return cat?.win ?? null;
}

/** Pomodoro rhythm: timed off of when she last actually left (manual hide or the end of
 * her stay) rather than a fixed clock — otherwise she could pop back up shortly after
 * you sent her away, just because some earlier absolute schedule happened to land there. */
function startSchedule(instance: CatInstance): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  function armNext(delayMs: number) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      if (stopped) return;
      if (!instance.isOut()) instance.trigger();
    }, delayMs);
  }

  function scheduleFromNow() {
    const minutes = getShowEveryMinutes();
    if (minutes == null) return; // manual only — nothing to schedule
    armNext(minutes * 60 * 1000);
  }

  // Re-arm the "show every" interval every time she leaves.
  const onHide = () => scheduleFromNow();
  instance.win.on("hide", onHide);

  // First appearance is a full work interval after launch.
  scheduleFromNow();

  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
    instance.win.removeListener("hide", onHide);
  };
}

export function createCat(): void {
  cat = new CatInstance();
  stopSchedule = startSchedule(cat);
}

/** Restarts the schedule loop — call when "show every" changes. */
export function restartSchedule(): void {
  if (!cat) return;
  stopSchedule();
  stopSchedule = startSchedule(cat);
}

export function onDurationChanged(): void {
  cat?.onDurationChanged();
}

export function isOut(): boolean {
  return cat?.isOut() ?? false;
}

export function toggle(): void {
  cat?.toggle();
}
