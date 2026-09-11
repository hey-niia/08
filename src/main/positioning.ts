import { screen } from "electron";

const MARGIN = 16;

/** Bottom-right corner of the work area (screen minus Dock/menu bar), recomputed live. */
export function getCornerPosition(width: number, height: number): { x: number; y: number } {
  const { workArea } = screen.getPrimaryDisplay();
  const x = workArea.x + workArea.width - width - MARGIN;
  const y = workArea.y + workArea.height - height - MARGIN;
  return { x, y };
}
