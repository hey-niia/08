import { screen } from "electron";

const MARGIN = 16;

/** Bottom-right corner of the work area (screen minus Dock/menu bar), recomputed live. */
export function getCornerPosition(width: number, height: number): { x: number; y: number } {
  const { workArea } = screen.getPrimaryDisplay();
  const x = workArea.x + workArea.width - width - MARGIN;
  const y = workArea.y + workArea.height - height - MARGIN;
  return { x, y };
}

/** For the cross-screen walk: y sits on the work area floor, x spans just off-screen on both sides. */
export function getWalkTrack(height: number): { y: number; leftX: number; rightX: number } {
  const { workArea } = screen.getPrimaryDisplay();
  const y = workArea.y + workArea.height - height;
  return {
    y,
    leftX: workArea.x - 40,
    rightX: workArea.x + workArea.width + 40,
  };
}
