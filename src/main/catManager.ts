import { CatInstance } from "./catInstance";
import { activeCats } from "./cats";
import { getCatCount, getShowEveryMinutes } from "./settings";

interface Managed {
  instance: CatInstance;
  stopSchedule: () => void;
}

let managed: Managed[] = [];
let onChangeListeners: (() => void)[] = [];

/** Called whenever the set of cat windows is torn down and recreated (cat-count changes). */
export function onWindowsChanged(listener: () => void): void {
  onChangeListeners.push(listener);
}

export function getWindows() {
  return managed.map((m) => m.instance.win);
}

/** Recursive setTimeout (not setInterval) so a frequency change picks up on the next fire
 * without needing to tear down and rebuild a running timer. */
function startSchedule(instance: CatInstance, staggerMs: number): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  function scheduleNext(delayOverrideMs?: number) {
    const minutes = getShowEveryMinutes();
    if (minutes == null) return; // manual only — nothing to schedule
    const delay = delayOverrideMs ?? minutes * 60 * 1000;
    timer = setTimeout(() => {
      if (stopped) return;
      if (!instance.isOut()) instance.trigger();
      scheduleNext();
    }, delay);
  }

  // First appearance is a short "I'm alive" delay (staggered per cat); afterwards it
  // follows the real show-every interval.
  scheduleNext(15000 + staggerMs);

  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
}

/** Tears down all current cat windows/schedules and recreates them from settings.
 * Call at startup and whenever the cat-count setting changes. */
export function rebuildCats(): void {
  managed.forEach(({ instance, stopSchedule }) => {
    stopSchedule();
    instance.destroy();
  });
  managed = activeCats(getCatCount()).map((cat, index) => {
    const instance = new CatInstance(cat);
    const stopSchedule = startSchedule(instance, index * 20000);
    return { instance, stopSchedule };
  });
  onChangeListeners.forEach((listener) => listener());
}

/** Restarts just the schedule loops (not the windows) — call when "show every" changes. */
export function restartSchedules(): void {
  managed.forEach((m, index) => {
    m.stopSchedule();
    m.stopSchedule = startSchedule(m.instance, index * 20000);
  });
}

export function onDurationChanged(): void {
  managed.forEach(({ instance }) => instance.onDurationChanged());
}

export function anyOut(): boolean {
  return managed.some(({ instance }) => instance.isOut());
}

export function toggleAll(): void {
  if (anyOut()) {
    managed.forEach(({ instance }) => instance.hide());
  } else {
    managed.forEach(({ instance }) => instance.trigger());
  }
}
