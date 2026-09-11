import { app } from "electron";
import * as fs from "fs";
import * as path from "path";

interface Settings {
  /** Minutes she stays visible before auto-hiding; null = stays until manually hidden. */
  stayMinutes: number | null;
}

const DEFAULTS: Settings = { stayMinutes: 5 };

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

function persist(settings: Settings): void {
  cache = settings;
  try {
    fs.mkdirSync(path.dirname(filePath()), { recursive: true });
    fs.writeFileSync(filePath(), JSON.stringify(settings));
  } catch {
    // Best-effort persistence — a failed write just means the default wins next launch.
  }
}

export function getStayMinutes(): number | null {
  return load().stayMinutes;
}

export function setStayMinutes(minutes: number | null): void {
  console.log("[08] setStayMinutes called with", minutes, "path:", filePath());
  persist({ stayMinutes: minutes });
}
