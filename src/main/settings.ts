import { app } from "electron";
import * as fs from "fs";
import * as path from "path";

interface Settings {
  /** Minutes she stays visible before auto-hiding; null = stays until manually hidden. */
  stayMinutes: number | null;
  /** How often she checks in on her own; null = manual only (no automatic schedule). */
  showEveryMinutes: number | null;
  /** How many cats from the roster are active (1-4). */
  catCount: number;
}

const DEFAULTS: Settings = { stayMinutes: 5, showEveryMinutes: 5, catCount: 1 };

function filePath(): string {
  return path.join(app.getPath("userData"), "settings.json");
}

let cache: Settings | null = null;

function load(): Settings {
  if (cache) return cache;
  let loaded: Settings;
  try {
    const raw = fs.readFileSync(filePath(), "utf-8");
    loaded = { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    loaded = { ...DEFAULTS };
  }
  cache = loaded;
  return loaded;
}

function persist(patch: Partial<Settings>): void {
  const next = { ...load(), ...patch };
  cache = next;
  try {
    fs.mkdirSync(path.dirname(filePath()), { recursive: true });
    fs.writeFileSync(filePath(), JSON.stringify(next));
  } catch {
    // Best-effort persistence — a failed write just means the default wins next launch.
  }
}

export function getStayMinutes(): number | null {
  return load().stayMinutes;
}

export function setStayMinutes(minutes: number | null): void {
  persist({ stayMinutes: minutes });
}

export function getShowEveryMinutes(): number | null {
  return load().showEveryMinutes;
}

export function setShowEveryMinutes(minutes: number | null): void {
  persist({ showEveryMinutes: minutes });
}

export function getCatCount(): number {
  return load().catCount;
}

export function setCatCount(count: number): void {
  persist({ catCount: count });
}
