import { screen } from "electron";

const MARGIN = 16;

/** Bottom-right corner of the work area (screen minus Dock/menu bar), recomputed live. */
export function getCornerPosition(width: number, height: number): { x: number; y: number } {
  const { workArea } = screen.getPrimaryDisplay();
  const x = workArea.x + workArea.width - width - MARGIN;
  const y = workArea.y + workArea.height - height - MARGIN;
  return { x, y };
}

const ROAM_MARGIN = 20;

/** A random point anywhere on screen (with a small margin) for the cat to wander to. */
export function randomRoamPoint(width: number, height: number): { x: number; y: number } {
  const { workArea } = screen.getPrimaryDisplay();
  const minX = workArea.x + ROAM_MARGIN;
  const minY = workArea.y + ROAM_MARGIN;
  const maxX = Math.max(minX, workArea.x + workArea.width - width - ROAM_MARGIN);
  const maxY = Math.max(minY, workArea.y + workArea.height - height - ROAM_MARGIN);
  return {
    x: minX + Math.random() * (maxX - minX),
    y: minY + Math.random() * (maxY - minY),
  };
}
