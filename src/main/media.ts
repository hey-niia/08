import { app } from "electron";
import * as fs from "fs";
import * as path from "path";

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".m4v"];

export function videoDir(): string {
  return path.join(app.getPath("userData"), "media");
}

export function ensureVideoDir(): void {
  fs.mkdirSync(videoDir(), { recursive: true });
}

/** The most recently modified video file in the media folder, if any — so dropping in a new file just works. */
export function videoPath(): string | null {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(videoDir(), { withFileTypes: true });
  } catch {
    return null;
  }

  const candidates = entries
    .filter((e) => e.isFile() && VIDEO_EXTENSIONS.includes(path.extname(e.name).toLowerCase()))
    .map((e) => path.join(videoDir(), e.name));

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return candidates[0];
}

export function hasVideo(): boolean {
  return videoPath() !== null;
}
