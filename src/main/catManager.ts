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

/** Timed off of when the cat last actually hid (manual hide or its own stay-duration
 * timeout) rather than a fixed clock — otherwise a cat can pop back up on its own
 * shortly after you hid it, just because some earlier, unrelated absolute schedule
 * happened to land there. */
function startSchedule(instance: CatInstance, staggerMs: number): () => void {
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

  // Re-arm the real show-every interval every time this cat hides, whether that
  // was a manual "Hide" or its own stay-duration timeout.
  const onHide = () => scheduleFromNow();
  instance.win.on("hide", onHide);

  // First appearance is a short "I'm alive" delay (staggered per cat).
  armNext(15000 + staggerMs);

  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
    instance.win.removeListener("hide", onHide);
  };
}

/** Tears down all current cat windows/schedules and recreates them from settings.
 * Call at startup and whenever the cat-count setting changes. If cats were currently
 * shown, the rebuilt set is shown right away too — changing the count should never
 * be the thing that makes the cats disappear. */
export function rebuildCats(): void {
  const wasOut = anyOut();
  managed.forEach(({ instance, stopSchedule }) => {
    stopSchedule();
    instance.destroy();
  });
  managed = activeCats(getCatCount()).map((cat, index) => {
    const instance = new CatInstance(cat);
    const stopSchedule = startSchedule(instance, index * 20000);
    return { instance, stopSchedule };
  });
  if (wasOut) {
    managed.forEach(({ instance }) => instance.trigger());
  }
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
